import EventEmitter from 'eventemitter3';

/**
 * Manages downloading a single avatar effect asset library.
 *
 * Similar to AvatarAssetDownloadLibrary but for effect animations.
 * Also extracts and stores animation data from the loaded resource.
 *
 * In AS3, this extends EventDispatcherWrapper and implements INamed.
 * The animation data is extracted from the loaded SWF resource's animation property.
 *
 * @see sources/win63_version/habbo/avatar/EffectAssetDownloadLibrary.as
 * @see sources/flash_version/com/sulake/habbo/avatar/EffectAssetDownloadLibrary.as
 */
export class EffectAssetDownloadLibrary extends EventEmitter
{
    public static readonly COMPLETE: string = 'EADL_COMPLETE';

    private static readonly STATE_IDLE: number = 0;
    private static readonly STATE_DOWNLOADING: number = 1;
    private static readonly STATE_READY: number = 2;

    private _name: string;
    private _revision: string;
    private _downloadUrl: string;
    private _state: number;
    private _animation: any | null;

    constructor(name: string, revision: string, downloadUrl: string)
    {
        super();

        this._name = name;
        this._revision = revision;
        this._downloadUrl = downloadUrl;
        this._state = EffectAssetDownloadLibrary.STATE_IDLE;
        this._animation = null;
    }

    /**
     * The name of this effect library.
     */
    public get name(): string
    {
        return this._name;
    }

    /**
     * Whether the library has finished downloading.
     */
    public get isReady(): boolean
    {
        return this._state === EffectAssetDownloadLibrary.STATE_READY;
    }

    /**
     * The animation data extracted from the loaded effect library.
     *
     * In AS3, this is XML data extracted from the loaded SWF resource's animation property.
     * In our port, this will be JSON animation data.
     */
    public get animation(): any | null
    {
        return this._animation;
    }

    /**
     * Begins downloading this effect library's assets.
     *
     * In AS3 this creates a URLRequest and loads via LibraryLoader.
     * On completion, extracts animation data from the resource and emits COMPLETE.
     */
    public async startDownloading(): Promise<void>
    {
        if(this._state !== EffectAssetDownloadLibrary.STATE_IDLE) return;

        this._state = EffectAssetDownloadLibrary.STATE_DOWNLOADING;

        try
        {
            const url = this._downloadUrl
                .replace('%libname%', this._name)
                .replace('%revision%', this._revision);

            // In PixiJS v8, effect assets and animation data will be loaded via Assets.load()
            // For now, mark as ready - actual loading will be connected with PixiJS Assets system
            this._state = EffectAssetDownloadLibrary.STATE_READY;
            this.emit(EffectAssetDownloadLibrary.COMPLETE, this);
        }
        catch(error)
        {
            console.error(`[EffectAssetDownloadLibrary] Failed to load: ${this._name}`, error);
            this._state = EffectAssetDownloadLibrary.STATE_READY;
            this.emit(EffectAssetDownloadLibrary.COMPLETE, this);
        }
    }

    public toString(): string
    {
        return this._name + (this.isReady ? '[x]' : '[ ]');
    }
}
