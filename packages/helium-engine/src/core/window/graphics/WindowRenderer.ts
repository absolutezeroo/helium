import type { IWindowRenderer } from './IWindowRenderer';
import type { ISkinContainer } from './ISkinContainer';
import type { IWindow } from '../IWindow';
import type { IWindowContext } from '../IWindowContext';

/**
 * Stub implementation of the window renderer.
 *
 * In AS3, WindowRenderer managed BitmapData draw buffers, dirty region
 * merging, and the full rendering pipeline. In TypeScript, actual rendering
 * is handled by the SolidJS client; this stub satisfies the interface for
 * the engine-side invalidation flow.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/graphics/WindowRenderer.as
 */
export class WindowRenderer implements IWindowRenderer
{
    private _disposed: boolean = false;
    private _debug: boolean = false;
    private _skinContainer: ISkinContainer;
    private _renderQueue: IWindow[] = [];
    private _dirtyRegions: ({ x: number; y: number; width: number; height: number }[])[] = [];

    constructor(skinContainer: ISkinContainer)
    {
        this._skinContainer = skinContainer;
    }

    public get disposed(): boolean
    {
        return this._disposed;
    }

    public get debug(): boolean
    {
        return this._debug;
    }

    public set debug(value: boolean)
    {
        this._debug = value;
    }

    /**
     * Renders all queued dirty windows.
     */
    public render(): void
    {
        this._renderQueue.length = 0;
        this._dirtyRegions.length = 0;
    }

    /**
     * Adds a window to the render queue with a dirty region.
     *
     * @param window - The window to render
     * @param rect - The dirty rectangle, or null for full window
     * @param _flags - Invalidation flags
     */
    public addToRenderQueue(window: IWindow, rect: { x: number; y: number; width: number; height: number } | null, _flags: number): void
    {
        const dirtyRect = rect
            ? { ...rect }
            : { x: 0, y: 0, width: window.renderingWidth, height: window.renderingHeight };

        const index = this._renderQueue.indexOf(window);

        if(index > -1)
        {
            this._dirtyRegions[index].push(dirtyRect);
        }
        else
        {
            this._renderQueue.push(window);
            this._dirtyRegions.push([dirtyRect]);
        }
    }

    /**
     * Clears the render queue without rendering.
     */
    public flushRenderQueue(): void
    {
        this._renderQueue.length = 0;
        this._dirtyRegions.length = 0;
    }

    /**
     * Invalidates all windows in the given context.
     *
     * @param context - The window context to invalidate
     * @param _rect - The invalidation rectangle
     */
    public invalidate(context: IWindowContext, _rect: { x: number; y: number; width: number; height: number }): void
    {
        const desktop = context.getDesktopWindow();

        if(!desktop)
        {
            return;
        }

        this.addToRenderQueue(desktop, null, 1);
    }

    /**
     * Returns the draw buffer for the given window.
     *
     * @param _window - The window to get the buffer for
     * @returns null (stub -- rendering handled by SolidJS)
     */
    public getDrawBufferForRenderable(_window: IWindow): unknown
    {
        return null;
    }

    /**
     * Purges cached render data.
     *
     * @param _window - The window to purge, or null for all
     * @param _recursive - Whether to recurse into children
     */
    public purge(_window?: IWindow | null, _recursive?: boolean): void
    {
        // Stub: no bitmap caching in TypeScript port
    }

    public dispose(): void
    {
        if(!this._disposed)
        {
            this._disposed = true;
            this._renderQueue.length = 0;
            this._dirtyRegions.length = 0;
        }
    }
}
