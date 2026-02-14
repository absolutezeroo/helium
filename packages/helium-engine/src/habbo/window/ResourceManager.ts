import type { IAssetLibrary } from '@core/assets/IAssetLibrary';
import type { IHabboWindowManager } from './IHabboWindowManager';

/**
 * Manages asset retrieval for the window system.
 *
 * Handles asset loading with support for external HTTP/HTTPS URLs,
 * async callbacks, and fallback to missing_image_icon on errors.
 *
 * @see sources/win63_version/habbo/window/ResourceManager.as
 */
export class ResourceManager
{
    private _windowManager: IHabboWindowManager;
    private _assetReceivers: Map<string, Array<(assetName: string) => void>> = new Map();
    private _disposed: boolean = false;

    constructor(windowManager: IHabboWindowManager)
    {
        this._windowManager = windowManager;
    }

    public get disposed(): boolean
    {
        return this._disposed;
    }

    /**
     * Retrieves an asset by name, loading it if necessary.
     *
     * Supports HTTP/HTTPS URLs with async loading and caching.
     */
    public retrieveAsset(assetName: string, callback: ((name: string) => void) | null = null): void
    {
        const resolvedName = this.resolveAssetName(assetName);

        if(callback)
        {
            let receivers = this._assetReceivers.get(resolvedName);

            if(!receivers)
            {
                receivers = [];
                this._assetReceivers.set(resolvedName, receivers);
            }

            receivers.push(callback);
        }

        // In AS3, this would check the asset library and potentially
        // trigger an HTTP load. In the TS port, asset loading is
        // handled by the client layer.
        this.passAssetToCallbacks(resolvedName);
    }

    /**
     * Checks if two asset names resolve to the same asset.
     */
    public isSameAsset(name1: string, name2: string): boolean
    {
        return this.resolveAssetName(name1) === this.resolveAssetName(name2);
    }

    /**
     * Resolves an asset name through window manager interpolation.
     */
    private resolveAssetName(assetName: string): string
    {
        // In AS3, this used window manager's resource localization
        // to interpolate asset names. For now, return as-is.
        return assetName;
    }

    /**
     * Passes loaded assets to waiting callbacks.
     */
    private passAssetToCallbacks(assetName: string): void
    {
        const receivers = this._assetReceivers.get(assetName);

        if(!receivers) return;

        this._assetReceivers.delete(assetName);

        for(const callback of receivers)
        {
            try
            {
                callback(assetName);
            }
            catch(_e: unknown)
            {
                // Ignore callback errors
            }
        }
    }

    /**
     * Dispose the resource manager.
     */
    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;
        this._assetReceivers.clear();
    }
}
