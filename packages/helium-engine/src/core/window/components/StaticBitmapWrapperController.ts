import type { IWindow } from '../IWindow';
import type { IWindowContext } from '../IWindowContext';
import type { IAssetReceiver } from '../IAssetReceiver';
import type { IResourceManager } from '../IResourceManager';
import type { IStaticBitmapWrapperWindow } from './IStaticBitmapWrapperWindow';
import { BitmapDataController } from './BitmapDataController';
import { WindowEvent } from '../events/WindowEvent';

/**
 * Controller for static bitmap wrapper windows.
 *
 * Extends BitmapDataController and implements IAssetReceiver. When `assetUri`
 * is set, requests the asset from the ResourceManager. When the asset is
 * delivered via `receiveAsset()`, stores it as `_bitmapData` and auto-sizes.
 *
 * @see sources/win63_version/core/window/components/StaticBitmapWrapperController.as
 */
export class StaticBitmapWrapperController extends BitmapDataController implements IStaticBitmapWrapperWindow, IAssetReceiver
{
    private _assetUri: string = '';
    private _ownsBitmapData: boolean = false;

    constructor(
        name: string,
        type: number,
        style: number,
        param: number,
        context: IWindowContext,
        rect: { x: number; y: number; width: number; height: number },
        parent: IWindow | null = null,
        procedure: ((event: WindowEvent, window: IWindow) => void) | null = null,
        tags: string[] | null = null,
        properties: unknown[] | null = null,
        id: number = 0,
        dynamicStyle: string = ''
    )
    {
        super(name, type, style, param, context, rect, parent, procedure, tags, properties, id, dynamicStyle);
    }

    /**
     * The asset URI for this static bitmap.
     *
     * Setting this triggers an asset request via the ResourceManager.
     * When the asset is loaded, `receiveAsset()` is called.
     *
     * In AS3: `StaticBitmapWrapperController._assetUri`
     */
    public get assetUri(): string
    {
        return this._assetUri;
    }

    public set assetUri(value: string)
    {
        if(this._assetUri === value) return;

        this._assetUri = value ?? '';

        if(!this._assetUri)
        {
            // Clear bitmap
            if(this._ownsBitmapData && this._bitmapData)
            {
                this._bitmapData.close();
            }

            this._bitmapData = null;
            this._ownsBitmapData = false;
            this._context.invalidate(this, null, 1);

            return;
        }

        // Request asset from resource manager
        const resourceManager = (this._context as unknown as { getResourceManager(): IResourceManager | null }).getResourceManager();

        if(resourceManager)
        {
            resourceManager.retrieveAsset(this._assetUri, this);
        }
    }

    /**
     * Callback from ResourceManager when the asset is loaded.
     *
     * In AS3: `receiveAsset(asset: IAsset, name: String)`
     *
     * @param bitmap - The decoded bitmap
     * @param uri - The resolved asset URI
     */
    public receiveAsset(bitmap: ImageBitmap, uri: string): void
    {
        if(this._disposed) return;

        // Verify the URI still matches (asset may have changed while loading)
        const resourceManager = (this._context as unknown as { getResourceManager(): IResourceManager | null }).getResourceManager();

        if(resourceManager && !resourceManager.isSameAsset(this._assetUri, uri)) return;

        // Dispose old bitmap if we own it
        if(this._ownsBitmapData && this._bitmapData && this._bitmapData !== bitmap)
        {
            this._bitmapData.close();
        }

        this._bitmapData = bitmap;
        this._ownsBitmapData = true;

        this.fitSize();
        this._context.invalidate(this, null, 1);
    }

    public override dispose(): void
    {
        if(this._disposed) return;

        if(this._ownsBitmapData && this._bitmapData)
        {
            this._bitmapData.close();
            this._bitmapData = null;
        }

        this._ownsBitmapData = false;

        super.dispose();
    }
}
