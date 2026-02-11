import EventEmitter from 'eventemitter3';

/**
 * Manages downloading a single avatar asset library (spritesheet).
 *
 * In AS3, this extends EventDispatcherWrapper and loads SWF libraries via LibraryLoader.
 * In our PixiJS v8 port, we use EventEmitter and fetch/Assets.load for JSON spritesheets.
 *
 * @see sources/win63_version/habbo/avatar/AvatarAssetDownloadLibrary.as
 * @see sources/flash_version/com/sulake/habbo/avatar/AvatarAssetDownloadLibrary.as
 */
export class AvatarAssetDownloadLibrary extends EventEmitter
{
    public static readonly COMPLETE: string = 'AADL_COMPLETE';

    private static readonly STATE_IDLE: number = 0;
    private static readonly STATE_DOWNLOADING: number = 1;
    private static readonly STATE_READY: number = 2;

    private _libraryName: string;
    private _revision: string;
    private _downloadUrl: string;
    private _state: number;
    private _isMandatory: boolean;

    constructor(libraryName: string, revision: string, downloadUrl: string)
    {
        super();

        this._libraryName = libraryName;
        this._revision = revision;
        this._downloadUrl = downloadUrl;
        this._state = AvatarAssetDownloadLibrary.STATE_IDLE;
        this._isMandatory = false;
    }

    /**
     * The name of this asset library.
     */
    public get libraryName(): string
    {
        return this._libraryName;
    }

    /**
     * Whether the library has finished downloading.
     */
    public get isReady(): boolean
    {
        return this._state === AvatarAssetDownloadLibrary.STATE_READY;
    }

    /**
     * Whether this library is a mandatory (core) library.
     */
    public get isMandatory(): boolean
    {
        return this._isMandatory;
    }

    public set isMandatory(value: boolean)
    {
        this._isMandatory = value;
    }

    /**
     * Begins downloading this library's assets.
     *
     * In AS3 this creates a URLRequest and loads via LibraryLoader into the asset library.
     * Here we build the URL from the template and trigger the load.
     * On completion (or error), emits COMPLETE.
     */
    public async startDownloading(): Promise<void>
    {
        if(this._state !== AvatarAssetDownloadLibrary.STATE_IDLE) return;

        this._state = AvatarAssetDownloadLibrary.STATE_DOWNLOADING;

        try
        {
            const url = this._downloadUrl
                .replace('%libname%', this._libraryName)
                .replace('%revision%', this._revision);

            // In PixiJS v8, assets are loaded via Assets.load()
            // For now, mark as ready - actual loading will be connected with PixiJS Assets system
            this._state = AvatarAssetDownloadLibrary.STATE_READY;
            this.emit(AvatarAssetDownloadLibrary.COMPLETE, this);
        }
        catch(error)
        {
            console.error(`[AvatarAssetDownloadLibrary] Failed to load: ${this._libraryName}`, error);
            this._state = AvatarAssetDownloadLibrary.STATE_READY;
            this.emit(AvatarAssetDownloadLibrary.COMPLETE, this);
        }
    }

    /**
     * Purges the loaded assets from memory, resetting the library to idle state.
     *
     * In AS3 this removes the asset library from the AssetLibraryCollection.
     */
    public purge(): void
    {
        // TODO: Remove loaded assets from PixiJS cache when asset integration is complete
        this._state = AvatarAssetDownloadLibrary.STATE_IDLE;
    }

    public toString(): string
    {
        return this._libraryName + (this.isReady ? '[x]' : '[ ]');
    }
}
