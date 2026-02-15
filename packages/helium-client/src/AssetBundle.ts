/**
 * Runtime loader for the packed asset bundle.
 *
 * Fetches a single `.bundle` file containing all images and JSONs,
 * parses the manifest header, and provides methods to extract individual
 * assets as blob URLs, ImageBitmaps, or parsed JSON objects.
 *
 * Bundle format:
 *   [4 bytes: manifest length (uint32 big-endian)]
 *   [N bytes: manifest JSON (UTF-8)]
 *   [remaining: concatenated file data]
 *
 * @see tools/bundle-assets.mjs
 */

/** A single entry in the bundle manifest. */
interface BundleEntry
{
    /** Byte offset within the data section. */
    offset: number;

    /** Byte size of the entry. */
    size: number;
}

/** The manifest stored at the beginning of the bundle. */
interface BundleManifest
{
    version: number;
    entries: Record<string, BundleEntry>;
}

/**
 * Runtime asset bundle loader.
 *
 * Usage:
 * ```typescript
 * const bundle = await AssetBundle.load('/assets.bundle', ratio => { ... });
 * const bitmap = await bundle.getImageBitmap('images/habbo_blue_skin.png');
 * const json = bundle.getJson('window-skins/element-description.json');
 * const url = bundle.getUrl('images/icon_name.png');
 * bundle.dispose();
 * ```
 */
export class AssetBundle
{
    private _manifest: BundleManifest;
    private _data: ArrayBuffer;
    private _dataOffset: number;
    private _urlCache: Map<string, string> = new Map();

    private constructor(manifest: BundleManifest, data: ArrayBuffer, dataOffset: number)
    {
        this._manifest = manifest;
        this._data = data;
        this._dataOffset = dataOffset;
    }

    /**
     * Loads a bundle from a URL with optional download progress tracking.
     *
     * Uses ReadableStream to track download progress byte-by-byte,
     * providing real-time feedback for the loading screen.
     *
     * @param url - URL to the .bundle file
     * @param onProgress - Optional callback receiving a ratio from 0.0 to 1.0
     * @returns The loaded AssetBundle
     */
    public static async load(url: string, onProgress?: (ratio: number) => void): Promise<AssetBundle>
    {
        const response = await fetch(url);

        if(!response.ok)
        {
            throw new Error(`[AssetBundle] Failed to load: ${response.status} ${response.statusText}`);
        }

        const contentLength = Number(response.headers.get('content-length') || 0);
        let buffer: ArrayBuffer;

        if(contentLength > 0 && response.body && onProgress)
        {
            // Stream download with progress tracking
            buffer = await AssetBundle.readWithProgress(response.body, contentLength, onProgress);
        }
        else
        {
            // Fallback: no progress tracking
            buffer = await response.arrayBuffer();
        }

        return AssetBundle.parse(buffer);
    }

    /**
     * Reads a ReadableStream into an ArrayBuffer while tracking progress.
     *
     * @param body - The response body stream
     * @param contentLength - Expected total size in bytes
     * @param onProgress - Progress callback (0.0 to 1.0)
     * @returns The complete ArrayBuffer
     */
    private static async readWithProgress(
        body: ReadableStream<Uint8Array>,
        contentLength: number,
        onProgress: (ratio: number) => void
    ): Promise<ArrayBuffer>
    {
        const reader = body.getReader();
        const chunks: Uint8Array[] = [];
        let received = 0;

        for(;;)
        {
            const { done, value } = await reader.read();

            if(done) break;

            chunks.push(value);
            received += value.length;
            onProgress(Math.min(received / contentLength, 1.0));
        }

        // Merge chunks into a single ArrayBuffer
        const result = new Uint8Array(received);
        let offset = 0;

        for(const chunk of chunks)
        {
            result.set(chunk, offset);
            offset += chunk.length;
        }

        return result.buffer;
    }

    /**
     * Parses a raw ArrayBuffer into an AssetBundle.
     *
     * @param buffer - The raw bundle data
     * @returns The parsed AssetBundle
     */
    private static parse(buffer: ArrayBuffer): AssetBundle
    {
        const view = new DataView(buffer);

        // Read manifest length (4 bytes, big-endian uint32)
        const manifestLength = view.getUint32(0, false);

        // Read manifest JSON
        const manifestBytes = new Uint8Array(buffer, 4, manifestLength);
        const manifestJson = new TextDecoder().decode(manifestBytes);
        const manifest: BundleManifest = JSON.parse(manifestJson);

        // Data section starts after header + manifest
        const dataOffset = 4 + manifestLength;

        return new AssetBundle(manifest, buffer, dataOffset);
    }

    /**
     * Gets the raw bytes for a bundle entry.
     *
     * @param key - Entry key (e.g., "images/icon_name.png")
     * @returns The entry's raw bytes, or null if not found
     */
    public getBytes(key: string): Uint8Array | null
    {
        const entry = this._manifest.entries[key];

        if(!entry) return null;

        return new Uint8Array(this._data, this._dataOffset + entry.offset, entry.size);
    }

    /**
     * Gets a Blob for a bundle entry.
     *
     * @param key - Entry key (e.g., "images/icon_name.png")
     * @param mimeType - MIME type for the blob (default: auto-detect from extension)
     * @returns The Blob, or null if not found
     */
    public getBlob(key: string, mimeType?: string): Blob | null
    {
        const entry = this._manifest.entries[key];

        if(!entry) return null;

        const type = mimeType || (key.endsWith('.png') ? 'image/png' : 'application/octet-stream');

        // Use ArrayBuffer.slice to avoid Uint8Array<ArrayBufferLike> typing issues
        const slice = this._data.slice(
            this._dataOffset + entry.offset,
            this._dataOffset + entry.offset + entry.size
        );

        return new Blob([slice], { type });
    }

    /**
     * Gets a blob URL for a bundle entry (cached).
     *
     * The URL is created via URL.createObjectURL and cached for reuse.
     * Call dispose() to revoke all created URLs.
     *
     * @param key - Entry key (e.g., "images/icon_name.png")
     * @returns The blob URL string, or null if not found
     */
    public getUrl(key: string): string | null
    {
        const cached = this._urlCache.get(key);

        if(cached) return cached;

        const blob = this.getBlob(key);

        if(!blob) return null;

        const url = URL.createObjectURL(blob);

        this._urlCache.set(key, url);

        return url;
    }

    /**
     * Creates an ImageBitmap from a bundle image entry.
     *
     * @param key - Entry key (e.g., "images/habbo_blue_skin.png")
     * @returns The decoded ImageBitmap, or null if not found
     */
    public async getImageBitmap(key: string): Promise<ImageBitmap | null>
    {
        const blob = this.getBlob(key);

        if(!blob) return null;

        return createImageBitmap(blob);
    }

    /**
     * Parses a JSON entry from the bundle.
     *
     * @param key - Entry key (e.g., "window-skins/element-description.json")
     * @returns The parsed JSON object, or null if not found
     */
    public getJson<T = unknown>(key: string): T | null
    {
        const bytes = this.getBytes(key);

        if(!bytes) return null;

        const text = new TextDecoder().decode(bytes);

        return JSON.parse(text) as T;
    }

    /**
     * Lists all entry keys that start with the given prefix.
     *
     * @param prefix - Key prefix to filter by (e.g., "images/", "window-skins/habbo_skin_")
     * @returns Array of matching keys
     */
    public listKeys(prefix?: string): string[]
    {
        const keys = Object.keys(this._manifest.entries);

        if(!prefix) return keys;

        return keys.filter(k => k.startsWith(prefix));
    }

    /**
     * Returns the number of entries in the bundle.
     */
    public get entryCount(): number
    {
        return Object.keys(this._manifest.entries).length;
    }

    /**
     * Revokes all created blob URLs and releases the internal buffer.
     */
    public dispose(): void
    {
        for(const url of this._urlCache.values())
        {
            URL.revokeObjectURL(url);
        }

        this._urlCache.clear();
    }
}
