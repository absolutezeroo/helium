import { Logger } from '@core/utils/Logger';
import type { IResourceManager } from '@core/window/IResourceManager';
import type { IAssetReceiver } from '@core/window/IAssetReceiver';
import type { IHabboWindowManager } from './IHabboWindowManager';

const log = Logger.getLogger('ResourceManager');

/**
 * Manages asset retrieval for the window system.
 *
 * Supports two registration modes:
 * 1. `registerAsset(name, bitmap)` — immediate: stores a decoded ImageBitmap
 * 2. `registerAssetUrl(name, url)` — lazy: stores a URL, decodes on first request
 *
 * When `retrieveAsset()` is called:
 * - If bitmap is cached → delivers immediately
 * - If a URL is registered → fetches, decodes, caches, then delivers
 * - Otherwise → queues the receiver for later delivery
 *
 * @see sources/win63_version/habbo/window/ResourceManager.as
 */
export class ResourceManager implements IResourceManager
{
    private _windowManager: IHabboWindowManager;
    private _assets: Map<string, ImageBitmap> = new Map();
    private _assetUrls: Map<string, string> = new Map();
    private _pendingReceivers: Map<string, IAssetReceiver[]> = new Map();
    private _loading: Set<string> = new Set();
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
     * Registers a bitmap asset by name (immediate).
     *
     * If there are pending receivers waiting for this asset,
     * delivers it to them immediately.
     *
     * @param name - The asset name
     * @param bitmap - The decoded bitmap
     */
    public registerAsset(name: string, bitmap: ImageBitmap): void
    {
        this._assets.set(name, bitmap);
        this._assetUrls.delete(name);

        // Deliver to any pending receivers
        this.deliverToReceivers(name, bitmap);
    }

    /**
     * Registers an asset URL for lazy loading.
     *
     * The bitmap is NOT decoded immediately. When `retrieveAsset()` is called
     * for this name, the URL is fetched and decoded on demand.
     *
     * @param name - The asset name
     * @param url - The URL to fetch the image from
     */
    public registerAssetUrl(name: string, url: string): void
    {
        if(this._assets.has(name)) return;

        this._assetUrls.set(name, url);
    }

    /**
     * Retrieves an asset by URI and delivers it to the receiver.
     *
     * If the asset is already cached, delivers immediately via
     * `receiver.receiveAsset()`. If a URL is registered, loads it
     * lazily. Otherwise, queues the receiver for later delivery.
     *
     * In AS3: `retrieveAsset(uri: String, receiver: IAssetReceiver)`
     *
     * @param uri - The asset URI
     * @param receiver - The receiver to deliver the asset to
     */
    public retrieveAsset(uri: string, receiver: IAssetReceiver): void
    {
        if(!uri || !receiver) return;

        const resolvedName = this.resolveAssetName(uri);

        // Check bitmap cache first
        const cached = this._assets.get(resolvedName);

        if(cached)
        {
            receiver.receiveAsset(cached, resolvedName);

            return;
        }

        // Queue receiver
        let receivers = this._pendingReceivers.get(resolvedName);

        if(!receivers)
        {
            receivers = [];
            this._pendingReceivers.set(resolvedName, receivers);
        }

        receivers.push(receiver);

        // If a URL is registered and not already loading, start loading
        const url = this._assetUrls.get(resolvedName);

        if(url && !this._loading.has(resolvedName))
        {
            this._loading.add(resolvedName);
            this.loadFromUrl(resolvedName, url);
        }
    }

    /**
     * Checks if two asset URIs resolve to the same asset.
     *
     * @param uri1 - First URI
     * @param uri2 - Second URI
     * @returns True if they resolve to the same asset
     */
    public isSameAsset(uri1: string, uri2: string): boolean
    {
        return this.resolveAssetName(uri1) === this.resolveAssetName(uri2);
    }

    /**
     * Resolves an asset name through window manager interpolation.
     *
     * In AS3, this used `_windowManager.interpolate()` for variable
     * substitution. For now, returns the URI as-is.
     *
     * @param uri - The raw asset URI
     * @returns The resolved asset name
     */
    private resolveAssetName(uri: string): string
    {
        return uri;
    }

    /**
     * Loads an image from a URL, caches it, and delivers to pending receivers.
     *
     * @param name - The asset name
     * @param url - The URL to fetch
     */
    private loadFromUrl(name: string, url: string): void
    {
        fetch(url)
            .then(response => response.blob())
            .then(blob => createImageBitmap(blob))
            .then(bitmap =>
            {
                if(this._disposed) return;

                this._loading.delete(name);
                this._assetUrls.delete(name);
                this._assets.set(name, bitmap);

                this.deliverToReceivers(name, bitmap);
            })
            .catch(() =>
            {
                this._loading.delete(name);
            });
    }

    /**
     * Delivers a bitmap to all pending receivers for the given name.
     *
     * @param name - The asset name
     * @param bitmap - The bitmap to deliver
     */
    private deliverToReceivers(name: string, bitmap: ImageBitmap): void
    {
        const receivers = this._pendingReceivers.get(name);

        if(!receivers) return;

        this._pendingReceivers.delete(name);

        for(const receiver of receivers)
        {
            if(!receiver.disposed)
            {
                try
                {
                    receiver.receiveAsset(bitmap, name);
                }
                catch(e: unknown)
                {
                    log.warn(`Error delivering asset "${ name }" to receiver:`, e);
                }
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
        this._assets.clear();
        this._assetUrls.clear();
        this._pendingReceivers.clear();
        this._loading.clear();
    }
}
