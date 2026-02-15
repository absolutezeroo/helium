import type { IWindowRenderer } from './IWindowRenderer';
import type { ISkinContainer } from './ISkinContainer';
import type { IWindow } from '../IWindow';
import type { IWindowContext } from '../IWindowContext';
import type { IWindowContainer } from '../IWindowContainer';
import { WindowRendererItem } from './WindowRendererItem';

/**
 * Window renderer managing per-window draw buffers.
 *
 * In AS3, WindowRenderer managed BitmapData draw buffers, dirty region
 * merging, and composited the full tree into a single BitmapData.
 * In TypeScript, each window gets its own OffscreenCanvas buffer; the
 * SolidJS client handles compositing via DOM layering.
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

    /** Per-window renderer items (AS3: Dictionary keyed by IWindow). */
    private _rendererItems: Map<IWindow, WindowRendererItem> = new Map();

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
     *
     * Port of AS3 WindowRenderer.render(). Processes the render queue,
     * rendering each window and its children via renderWindowBranch().
     */
    public render(): void
    {
        while(this._renderQueue.length > 0)
        {
            const window = this._renderQueue.pop()!;
            const dirtyRects = this._dirtyRegions.pop()!;

            if(window.disposed) continue;

            for(const dirtyRect of dirtyRects)
            {
                this.renderWindowBranch(window, dirtyRect);
            }
        }
    }

    /**
     * Recursively renders a window and its children.
     *
     * Port of AS3 WindowRenderer.renderWindowBranch(). In AS3 this composited
     * into a parent BitmapData; in TS each window renders into its own buffer.
     *
     * @param window - The window to render
     * @param dirtyRegion - The dirty region to render
     */
    private renderWindowBranch(
        window: IWindow,
        dirtyRegion: { x: number; y: number; width: number; height: number }
    ): void
    {
        if(!window.visible) return;

        // Render this window's skin into its own buffer
        const item = this.getWindowRendererItem(window);

        item.render(window);

        // Recurse into children if this is a container
        const container = window as unknown as IWindowContainer;

        if(typeof container.numChildren !== 'number') return;

        for(let i = 0; i < container.numChildren; i++)
        {
            const child = container.getChildAt(i);

            if(!child || !child.visible) continue;

            // Check if child intersects dirty region
            const childRect = {
                x: child.x,
                y: child.y,
                width: child.width,
                height: child.height
            };

            if(this.rectsIntersect(childRect, dirtyRegion))
            {
                // Offset dirty region to child's local space
                const childDirty = {
                    x: dirtyRegion.x - child.x,
                    y: dirtyRegion.y - child.y,
                    width: dirtyRegion.width,
                    height: dirtyRegion.height
                };

                this.renderWindowBranch(child, childDirty);
            }
        }
    }

    /**
     * Returns the WindowRendererItem for a window, creating one if needed.
     *
     * Port of AS3 WindowRenderer.getWindowRendererItem().
     *
     * @param window - The window
     * @returns The renderer item
     */
    private getWindowRendererItem(window: IWindow): WindowRendererItem
    {
        let item = this._rendererItems.get(window);

        if(!item)
        {
            item = new WindowRendererItem(this._skinContainer);
            this._rendererItems.set(window, item);
        }

        return item;
    }

    /**
     * Tests if two rectangles intersect.
     *
     * @param a - First rectangle
     * @param b - Second rectangle
     * @returns True if they intersect
     */
    private rectsIntersect(
        a: { x: number; y: number; width: number; height: number },
        b: { x: number; y: number; width: number; height: number }
    ): boolean
    {
        return a.x < b.x + b.width
            && a.x + a.width > b.x
            && a.y < b.y + b.height
            && a.y + a.height > b.y;
    }

    /**
     * Adds a window to the render queue with a dirty region.
     *
     * @param window - The window to render
     * @param rect - The dirty rectangle, or null for full window
     * @param flags - Invalidation flags
     */
    public addToRenderQueue(window: IWindow, rect: { x: number; y: number; width: number; height: number } | null, flags: number): void
    {
        const dirtyRect = rect
            ? { ...rect }
            : { x: 0, y: 0, width: window.renderingWidth, height: window.renderingHeight };

        // Invalidate the renderer item
        const item = this.getWindowRendererItem(window);

        if(!item.invalidate(window, flags)) return;

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

        if(!desktop) return;

        this.addToRenderQueue(desktop, null, 1);
    }

    /**
     * Returns the draw buffer for the given window.
     *
     * Port of AS3 WindowRenderer.getDrawBufferForRenderable().
     * Creates and renders a buffer if one doesn't exist yet.
     *
     * @param window - The window to get the buffer for
     * @returns The OffscreenCanvas buffer, or null
     */
    public getDrawBufferForRenderable(window: IWindow): OffscreenCanvas | null
    {
        let item = this._rendererItems.get(window);

        if(!item)
        {
            item = new WindowRendererItem(this._skinContainer);
            item.invalidate(window, 1);
            item.render(window);
            this._rendererItems.set(window, item);
        }

        return item.buffer;
    }

    /**
     * Purges cached render data.
     *
     * @param window - The window to purge, or null for all
     * @param recursive - Whether to recurse into children
     */
    public purge(window?: IWindow | null, recursive?: boolean): void
    {
        if(window)
        {
            const item = this._rendererItems.get(window);

            if(item)
            {
                if(!window.visible || !recursive)
                {
                    item.dispose();
                    this._rendererItems.delete(window);
                }
                else
                {
                    item.purge();
                }
            }

            // Recurse into children
            if(recursive)
            {
                const container = window as unknown as IWindowContainer;

                if(typeof container.numChildren === 'number')
                {
                    for(let i = 0; i < container.numChildren; i++)
                    {
                        const child = container.getChildAt(i);

                        if(child)
                        {
                            this.purge(child, recursive);
                        }
                    }
                }
            }
        }
        else
        {
            // Purge all
            for(const [win, item] of this._rendererItems)
            {
                if(!win.visible || !recursive)
                {
                    item.dispose();
                    this._rendererItems.delete(win);
                }
            }
        }
    }

    /**
     * Removes renderer data for a disposed window.
     *
     * @param window - The window to remove
     */
    public removeRenderable(window: IWindow): void
    {
        const item = this._rendererItems.get(window);

        if(item)
        {
            item.dispose();
            this._rendererItems.delete(window);
        }
    }

    public dispose(): void
    {
        if(!this._disposed)
        {
            this._disposed = true;

            for(const item of this._rendererItems.values())
            {
                item.dispose();
            }

            this._rendererItems.clear();
            this._renderQueue.length = 0;
            this._dirtyRegions.length = 0;
        }
    }
}
