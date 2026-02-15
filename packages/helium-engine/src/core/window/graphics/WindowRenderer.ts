import type { IWindowRenderer } from './IWindowRenderer';
import type { ISkinContainer } from './ISkinContainer';
import type { IWindow } from '../IWindow';
import type { IWindowContext } from '../IWindowContext';
import type { IWindowContainer } from '../IWindowContainer';
import { WindowRendererItem } from './WindowRendererItem';

/**
 * Window renderer managing per-window draw buffers and compositing.
 *
 * In AS3, WindowRenderer managed BitmapData draw buffers, dirty region
 * merging, and composited the full tree into a single BitmapData displayed
 * as a Bitmap on the Stage. In TypeScript, each window gets its own
 * OffscreenCanvas buffer; composite() merges them all into a single buffer.
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

    /** Composite buffer for full-scene rendering. */
    private _compositeBuffer: OffscreenCanvas | null = null;
    private _compositeCtx: OffscreenCanvasRenderingContext2D | null = null;

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

    /**
     * Composites all window layers into a single OffscreenCanvas buffer.
     *
     * Walks each context layer (0→3), retrieves its desktop window,
     * and recursively draws each window's skin buffer at its absolute position.
     * This mirrors AS3's WindowRenderer.renderWindowBranch() compositing
     * into a single BitmapData displayed as a Bitmap on the Stage.
     *
     * @param contexts - The array of window contexts (one per layer)
     * @param width - The target buffer width
     * @param height - The target buffer height
     * @returns The composited OffscreenCanvas buffer
     *
     * @see sources/win63_2021_version/com/sulake/core/window/graphics/WindowRenderer.as renderWindowBranch()
     */
    public composite(contexts: IWindowContext[], width: number, height: number): OffscreenCanvas
    {
        // Create or resize the composite buffer
        if(!this._compositeBuffer || this._compositeBuffer.width !== width || this._compositeBuffer.height !== height)
        {
            this._compositeBuffer = new OffscreenCanvas(width, height);
            this._compositeCtx = this._compositeBuffer.getContext('2d');
        }

        const ctx = this._compositeCtx!;

        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, width, height);

        // Walk layers 0→3 (background → tooltips)
        for(let i = 0; i < contexts.length; i++)
        {
            const desktop = contexts[i].getDesktopWindow();

            if(!desktop || !desktop.visible) continue;

            // Render desktop's children (not the desktop itself — it's a root container)
            const container = desktop as unknown as IWindowContainer;

            if(typeof container.numChildren !== 'number') continue;

            for(let j = 0; j < container.numChildren; j++)
            {
                const child = container.getChildAt(j);

                if(child)
                {
                    this.compositeWindow(ctx, child, 0, 0);
                }
            }
        }

        return this._compositeBuffer;
    }

    /**
     * Recursively composites a window and its children onto the target context.
     *
     * @param ctx - The 2D rendering context to draw into
     * @param window - The window to composite
     * @param offsetX - The parent's absolute X offset
     * @param offsetY - The parent's absolute Y offset
     */
    private compositeWindow(
        ctx: OffscreenCanvasRenderingContext2D,
        window: IWindow,
        offsetX: number,
        offsetY: number
    ): void
    {
        if(!window.visible) return;

        const absX = offsetX + window.x;
        const absY = offsetY + window.y;
        const w = window.width;
        const h = window.height;

        if(w <= 0 || h <= 0) return;

        ctx.save();

        // Clip to window bounds
        if(window.clipping)
        {
            ctx.beginPath();
            ctx.rect(absX, absY, w, h);
            ctx.clip();
        }

        // Apply blend (opacity)
        const blend = window.blend;

        if(blend < 1)
        {
            ctx.globalAlpha = blend;
        }

        // Draw background fill if the window has one
        if(window.background)
        {
            const color = window.color;
            const a = ((color >>> 24) & 0xFF) / 255;
            const r = (color >> 16) & 0xFF;
            const g = (color >> 8) & 0xFF;
            const b = color & 0xFF;

            ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
            ctx.fillRect(absX, absY, w, h);
        }

        // Draw the skin buffer
        const buffer = this.getDrawBufferForRenderable(window);

        if(buffer && buffer.width > 0 && buffer.height > 0)
        {
            ctx.drawImage(buffer, absX, absY);
        }

        // Recurse into children
        const container = window as unknown as IWindowContainer;

        if(typeof container.numChildren === 'number')
        {
            for(let i = 0; i < container.numChildren; i++)
            {
                const child = container.getChildAt(i);

                if(child)
                {
                    this.compositeWindow(ctx, child, absX, absY);
                }
            }
        }

        ctx.restore();
    }

    /**
     * Finds the deepest visible window at the given point.
     *
     * Iterates layers in REVERSE order (tooltips → background) so that
     * the topmost layer wins. Within each layer, children are tested in
     * reverse order (last child = visually on top).
     *
     * @param contexts - The array of window contexts (one per layer)
     * @param x - The global X coordinate
     * @param y - The global Y coordinate
     * @returns The deepest window at the point, or null
     *
     * @see sources/win63_2021_version/com/sulake/core/window/components/ContainerController.as getChildUnderPoint()
     */
    public findWindowAtPoint(contexts: IWindowContext[], x: number, y: number): IWindow | null
    {
        // Iterate layers in REVERSE (tooltips → background)
        for(let i = contexts.length - 1; i >= 0; i--)
        {
            const desktop = contexts[i].getDesktopWindow();

            if(!desktop || !desktop.visible) continue;

            const container = desktop as unknown as IWindowContainer;

            if(typeof container.numChildren !== 'number') continue;

            // Test children in reverse (topmost first)
            for(let j = container.numChildren - 1; j >= 0; j--)
            {
                const child = container.getChildAt(j);

                if(!child) continue;

                const hit = this.hitTestRecursive(child, x, y, 0, 0);

                if(hit) return hit;
            }
        }

        return null;
    }

    /**
     * Recursively hit-tests a window tree.
     *
     * @param window - The window to test
     * @param globalX - The global X coordinate
     * @param globalY - The global Y coordinate
     * @param offsetX - The parent's absolute X offset
     * @param offsetY - The parent's absolute Y offset
     * @returns The deepest matching window, or null
     */
    private hitTestRecursive(
        window: IWindow,
        globalX: number,
        globalY: number,
        offsetX: number,
        offsetY: number
    ): IWindow | null
    {
        if(!window.visible) return null;

        // FLAG 9 = INTERNAL_EVENT_HANDLING → ignore mouse events
        if(window.testParamFlag(9))
        {
            return null;
        }

        const absX = offsetX + window.x;
        const absY = offsetY + window.y;
        const w = window.width;
        const h = window.height;

        // AABB bounds test
        if(globalX < absX || globalX >= absX + w || globalY < absY || globalY >= absY + h)
        {
            return null;
        }

        // Test children in reverse (topmost first)
        const container = window as unknown as IWindowContainer;

        if(typeof container.numChildren === 'number')
        {
            for(let i = container.numChildren - 1; i >= 0; i--)
            {
                const child = container.getChildAt(i);

                if(!child) continue;

                const hit = this.hitTestRecursive(child, globalX, globalY, absX, absY);

                if(hit) return hit;
            }
        }

        // No child matched, but this window contains the point
        return window;
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
            this._compositeBuffer = null;
            this._compositeCtx = null;
        }
    }
}
