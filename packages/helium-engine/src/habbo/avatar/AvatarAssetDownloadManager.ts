import EventEmitter from 'eventemitter3';
import type { IAvatarFigureContainer } from './IAvatarFigureContainer';
import type { IAvatarImageListener } from './IAvatarImageListener';
import type { AvatarStructure } from './AvatarStructure';
import { AvatarAssetDownloadLibrary } from './AvatarAssetDownloadLibrary';

/**
 * Manages downloading avatar asset libraries based on figure data.
 *
 * Parses the figure map to create library-to-part mappings, then downloads
 * the required libraries when a figure's assets are requested. Libraries are
 * queued and downloaded with a maximum of 4 simultaneous downloads.
 * Listeners are notified when all libraries for a given figure are ready.
 *
 * In AS3, this extends EventDispatcherWrapper and uses Timer + URLRequest for
 * download scheduling. The mandatory libraries are "hh_human_body" and "hh_human_item".
 *
 * @see sources/win63_version/habbo/avatar/AvatarAssetDownloadManager.as
 * @see sources/flash_version/com/sulake/habbo/avatar/AvatarAssetDownloadManager.as
 */
export class AvatarAssetDownloadManager extends EventEmitter
{
    public static readonly LIBRARY_LOADED: string = 'LIBRARY_LOADED';

    private static readonly MAX_SIMULTANEOUS_DOWNLOADS: number = 4;
    private static readonly LIB_BODY: string = 'hh_human_body';
    private static readonly LIB_ITEMS: string = 'hh_human_item';

    private _structure: AvatarStructure;
    private _libraries: Map<string, AvatarAssetDownloadLibrary>;
    private _figureMap: Map<string, AvatarAssetDownloadLibrary[]>;
    private _incompleteFigures: Map<string, AvatarAssetDownloadLibrary[]>;
    private _listeners: Map<string, IAvatarImageListener[]>;
    private _pendingDownloadQueue: AvatarAssetDownloadLibrary[];
    private _currentDownloads: AvatarAssetDownloadLibrary[];
    private _initDownloadBuffer: [IAvatarFigureContainer, IAvatarImageListener | null][];
    private _isReady: boolean;
    private _downloadUrl: string;
    private _mandatoryLibs: string[];

    constructor(
        downloadUrl: string,
        structure: AvatarStructure
    )
    {
        super();

        this._structure = structure;
        this._downloadUrl = downloadUrl;
        this._libraries = new Map();
        this._figureMap = new Map();
        this._incompleteFigures = new Map();
        this._listeners = new Map();
        this._pendingDownloadQueue = [];
        this._currentDownloads = [];
        this._initDownloadBuffer = [];
        this._isReady = false;
        this._mandatoryLibs = [
            AvatarAssetDownloadManager.LIB_BODY,
            AvatarAssetDownloadManager.LIB_ITEMS
        ];
    }

    /**
     * Parses figure map data and starts downloading mandatory libraries.
     *
     * In AS3, this is called after the figuremap XML is loaded from URL or cache.
     * The map is generated and mandatory libs are queued for download.
     *
     * @param data - The figure map data (JSON, adapted from XML)
     */
    public loadFigureMap(data: any): void
    {
        if(!data) return;

        if(typeof data === 'object' && Object.keys(data).length === 0) return;

        this.generateMap(data);
        this.loadMandatoryLibs();
        this._isReady = true;
    }

    /**
     * Generates the library-to-figure-part mapping from figure map data.
     *
     * In AS3, iterates XML `<lib>` elements, creating AvatarAssetDownloadLibrary instances
     * and mapping their `<part>` children by "type:id" keys.
     */
    private generateMap(data: any): void
    {
        if(!data || !data.libraries) return;

        for(const libData of data.libraries)
        {
            const libName = String(libData.id || '');
            const revision = String(libData.revision || '');

            if(libName === '') continue;

            const library = new AvatarAssetDownloadLibrary(
                libName,
                revision,
                this._downloadUrl
            );

            library.on(AvatarAssetDownloadLibrary.COMPLETE, () => this.onLibraryComplete(library));

            this._libraries.set(libName, library);

            if(libData.parts)
            {
                for(const partData of libData.parts)
                {
                    const partType = String(partData.type || '');
                    const partId = String(partData.id || '');

                    if(partType === '' || partId === '') continue;

                    const key = partType + ':' + partId;

                    if(!this._figureMap.has(key))
                    {
                        this._figureMap.set(key, []);
                    }

                    this._figureMap.get(key)!.push(library);
                }
            }
        }
    }

    /**
     * Checks whether all required libraries for a figure are already downloaded.
     *
     * @param figure - The figure container to check
     * @returns True if all required libraries are ready
     */
    public isReady(figure: IAvatarFigureContainer): boolean
    {
        if(!this._isReady) return false;

        const libs = this.getLibsToDownload(figure);

        return libs.length === 0;
    }

    /**
     * Returns whether any mandatory libraries are still missing.
     */
    public isMissingMandatoryLibs(): boolean
    {
        return this._mandatoryLibs.length > 0;
    }

    /**
     * Initiates loading of all asset libraries required by the given figure.
     *
     * If the manager is not yet ready, the request is buffered for later processing.
     * If all libraries are already downloaded, the listener is notified immediately.
     * Otherwise, the required libraries are queued for download and the listener
     * is registered for notification when all are complete.
     *
     * @param figure - The figure container describing the avatar
     * @param listener - Optional listener to notify when assets are ready
     */
    public loadFigureSetData(figure: IAvatarFigureContainer, listener: IAvatarImageListener | null = null): void
    {
        if(!this._isReady)
        {
            this._initDownloadBuffer.push([figure, listener]);
            return;
        }

        const figureString = figure.getFigureString();
        const libs = this.getLibsToDownload(figure);

        if(libs.length > 0)
        {
            if(listener && !listener.disposed)
            {
                if(!this._listeners.has(figureString))
                {
                    this._listeners.set(figureString, []);
                }

                this._listeners.get(figureString)!.push(listener);
            }

            this._incompleteFigures.set(figureString, libs);

            for(const lib of libs)
            {
                this.addToQueue(lib);
            }

            this.processPending();
        }
        else if(listener !== null && !listener.disposed)
        {
            listener.avatarImageReady(figureString);
        }
    }

    /**
     * Determines which libraries still need to be downloaded for a given figure.
     *
     * In AS3, this iterates the figure's part type IDs, looks up each part set,
     * then checks each part's "type:id" key against the figure map for unready libraries.
     */
    private getLibsToDownload(figure: IAvatarFigureContainer): AvatarAssetDownloadLibrary[]
    {
        const result: AvatarAssetDownloadLibrary[] = [];

        if(!this._structure) return result;
        if(!figure) return result;

        const figureData = this._structure.figureData;

        if(!figureData) return result;

        const partTypes = figure.getPartTypeIds();

        for(const partType of partTypes)
        {
            const setType = figureData.getSetType(partType);

            if(setType)
            {
                const partSetId = figure.getPartSetId(partType);
                const partSet = setType.getPartSet(partSetId);

                if(partSet)
                {
                    for(const part of partSet.parts)
                    {
                        const key = part.type + ':' + part.id;
                        const libs = this._figureMap.get(key);

                        if(libs)
                        {
                            for(const lib of libs)
                            {
                                if(lib && !lib.isReady && result.indexOf(lib) === -1)
                                {
                                    result.push(lib);
                                }
                            }
                        }
                    }
                }
            }
        }

        return result;
    }

    /**
     * Callback invoked when a library finishes downloading.
     *
     * Removes the library from current downloads, checks which pending figures
     * are now complete, notifies their listeners, removes the completed library
     * from the mandatory list if applicable, and triggers the next batch of downloads.
     */
    private onLibraryComplete(library: AvatarAssetDownloadLibrary): void
    {
        // Remove from current downloads
        const downloadIndex = this._currentDownloads.indexOf(library);

        if(downloadIndex !== -1)
        {
            this._currentDownloads.splice(downloadIndex, 1);
        }

        // Check which pending figures are now complete
        const completedFigures: string[] = [];

        for(const [figureString, libs] of this._incompleteFigures)
        {
            const allReady = libs.every(lib => lib.isReady);

            if(allReady)
            {
                completedFigures.push(figureString);

                const listeners = this._listeners.get(figureString);

                if(listeners)
                {
                    for(const listener of listeners)
                    {
                        if(listener && !listener.disposed)
                        {
                            listener.avatarImageReady(figureString);
                        }
                    }

                    this._listeners.delete(figureString);
                }
            }
        }

        for(const figureString of completedFigures)
        {
            this._incompleteFigures.delete(figureString);
        }

        // Remove from mandatory libs if applicable
        const mandatoryIndex = this._mandatoryLibs.indexOf(library.libraryName);

        if(mandatoryIndex !== -1)
        {
            this._mandatoryLibs.splice(mandatoryIndex, 1);
        }

        if(completedFigures.length > 0)
        {
            this.emit(AvatarAssetDownloadManager.LIBRARY_LOADED, library.libraryName);
        }

        this.processPending();
    }

    /**
     * Adds a library to the pending download queue if not already queued or downloading.
     */
    private addToQueue(library: AvatarAssetDownloadLibrary): void
    {
        if(!library.isReady && this._pendingDownloadQueue.indexOf(library) === -1 && this._currentDownloads.indexOf(library) === -1)
        {
            this._pendingDownloadQueue.push(library);
        }
    }

    /**
     * Processes the pending download queue, starting downloads up to the maximum limit.
     *
     * In AS3, this is triggered by a Timer with 100ms delay.
     */
    private processPending(): void
    {
        while(this._pendingDownloadQueue.length > 0 && this._currentDownloads.length < AvatarAssetDownloadManager.MAX_SIMULTANEOUS_DOWNLOADS)
        {
            const library = this._pendingDownloadQueue.shift()!;

            this._currentDownloads.push(library);
            library.startDownloading();
        }
    }

    /**
     * Loads mandatory libraries (hh_human_body, hh_human_item).
     *
     * These are required for basic avatar rendering and are queued immediately.
     */
    private loadMandatoryLibs(): void
    {
        const libs = this._mandatoryLibs.slice();

        for(const libName of libs)
        {
            const lib = this._libraries.get(libName);

            if(lib)
            {
                lib.isMandatory = true;
                this.addToQueue(lib);
            }
        }

        this.processPending();
    }

    /**
     * Flushes the init download buffer, processing any requests that were queued
     * before the manager was ready.
     */
    public processInitBuffer(): void
    {
        for(const [figure, listener] of this._initDownloadBuffer)
        {
            this.loadFigureSetData(figure, listener);
        }

        this._initDownloadBuffer = [];
    }

    /**
     * Purges all non-mandatory libraries to free memory.
     *
     * In AS3, this iterates all libraries and calls purge() on those
     * that are ready and not mandatory.
     */
    public purge(): void
    {
        for(const library of this._libraries.values())
        {
            if(library.isReady && !library.isMandatory)
            {
                library.purge();
            }
        }
    }

    public dispose(): void
    {
        this._libraries.clear();
        this._figureMap.clear();
        this._incompleteFigures.clear();
        this._listeners.clear();
        this._pendingDownloadQueue = [];
        this._currentDownloads = [];
        this._initDownloadBuffer = [];
    }
}
