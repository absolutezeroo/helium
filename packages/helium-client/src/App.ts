import type {IHeliumConfig} from 'helium-engine';
import {Helium} from 'helium-engine';
import type {ISkinData} from '@core/window';
import type {IWindow} from '@core/window/IWindow';
import {WindowController} from '@core/window/WindowController';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {WindowMouseOperator} from '@core/window/services/WindowMouseOperator';
import './_index.scss';

// Skin spritesheet PNGs — Vite resolves these to URLs
import blueSkinUrl from './assets/images/habbo_blue_skin.png';
import skinUbuntuUrl from './assets/images/habbo_skin_ubuntu.png';
import skinIlluminaDarkUrl from './assets/images/habbo_skin_illumina_dark.png';
import skinIlluminaLightUrl from './assets/images/habbo_skin_illumina_light.png';
import habboIconsUrl from './assets/images/habbo_icons.png';
import skinUbuntuBg9Url from './assets/images/skin_ubuntu_bg_9.png';
import {IElementDescriptionData} from "@habbo/window";

// Eagerly import all skin JSONs via Vite glob
const skinModules = import.meta.glob('./assets/window-skins/habbo_skin_*.json', { eager: true }) as Record<string, { default: ISkinData }>;

// Eagerly import all window layout JSONs via Vite glob
const layoutModules = import.meta.glob('./assets/window-layouts/*.json', { eager: true }) as Record<string, { default: unknown }>;

// Eagerly import ALL image PNGs for ResourceManager registration
const imageModules = import.meta.glob('./assets/images/*.png', { eager: true }) as Record<string, { default: string }>;

/** Atlas asset name → URL mapping. */
const ATLAS_MAP: Record<string, string> = {
    'habbo_blue_skin': blueSkinUrl,
    'habbo_skin_ubuntu': skinUbuntuUrl,
    'habbo_skin_illumina_dark': skinIlluminaDarkUrl,
    'habbo_skin_illumina_light': skinIlluminaLightUrl,
    'habbo_icons': habboIconsUrl,
    'skin_ubuntu_bg_9': skinUbuntuBg9Url,
};

declare global
{
    interface Window
    {
        HeliumConfig?: IHeliumConfig;
    }
}

/**
 * Loads an image URL as an ImageBitmap.
 *
 * @param url - The image URL
 * @returns The decoded ImageBitmap
 */
async function loadImageBitmap(url: string): Promise<ImageBitmap>
{
    const response = await fetch(url);
    const blob = await response.blob();

    return createImageBitmap(blob);
}

/**
 * HeliumApp — Canvas-based application shell.
 *
 * Replaces the SolidJS rendering pipeline with a single `<canvas>` element.
 * The engine's WindowRenderer composites all window layers into an OffscreenCanvas,
 * which is then drawn onto the DOM canvas via requestAnimationFrame. Mouse events
 * on the canvas are hit-tested against the window tree and dispatched to the
 * appropriate WindowController.
 *
 * This mirrors the AS3 pattern where WindowRenderer composed everything into a
 * single BitmapData displayed as a Bitmap on the Stage.
 */
export class HeliumApp
{
    private _canvas: HTMLCanvasElement | null = null;
    private _ctx: CanvasRenderingContext2D | null = null;
    private _animFrameId: number = 0;
    private _disposed: boolean = false;

    /** Last hovered window for OVER/OUT tracking. */
    private _lastHoveredWindow: IWindow | null = null;

    /** Whether the mouse button is currently down. */
    private _mouseDown: boolean = false;

    /** The window that received the last DOWN event (for drag/UP tracking). */
    private _mouseDownWindow: IWindow | null = null;

    /** Document-level mousemove handler (for drag/scale). */
    private _docMoveHandler: ((e: MouseEvent) => void) | null = null;

    /** Document-level mouseup handler (for drag/scale). */
    private _docUpHandler: ((e: MouseEvent) => void) | null = null;

    /**
     * Initializes the application.
     *
     * Bootstraps the engine, loads skins/layouts, creates the canvas,
     * and starts the render loop.
     */
    public async init(): Promise<void>
    {
        // 1. Bootstrap the engine
        try
        {
            await Helium.bootstrap(window.HeliumConfig);
        }
        catch(error)
        {
            console.warn('[HeliumApp] Bootstrap error (connection may have failed):', error);
        }

        const helium = Helium.instance;

        // 2. Load element descriptions + skin assets in parallel
        try
        {
            const [elementDescription, bitmaps] = await Promise.all([
                import('./assets/window-skins/element-description.json')
                    .then(mod => this.unwrapDefault<IElementDescriptionData>(mod)),
                Promise.all(Object.values(ATLAS_MAP).map(loadImageBitmap)),
            ]);

            helium.windowManager.loadElementDescription(elementDescription);

            const atlasKeys = Object.keys(ATLAS_MAP);
            const atlases = new Map<string, ImageBitmap>(
                atlasKeys.map((key, i) => [key, bitmaps[i]])
            );

            const skins = new Map<string, ISkinData>(
                Object.values(skinModules).map(mod =>
                {
                    const skin = this.unwrapDefault<ISkinData>(mod);
                    return [skin.id, skin];
                })
            );

            helium.windowManager.loadSkinAssets(skins, atlases);
        }
        catch(error)
        {
            console.warn('[HeliumApp] Failed to load skin/element assets:', error);
        }

        // 3. Register all window layouts
        for(const [path, mod] of Object.entries(layoutModules))
        {
            const name = path.split('/').pop()!.replace('.json', '');
            helium.windowManager.registerWidgetLayout(name, this.unwrapDefault(mod));
        }

        // 5. Create the canvas and set desktop sizes BEFORE creating windows
        this.createCanvas();

        // 6. Register all image asset URLs with the resource manager (lazy loading)
        this.registerImageAssets();

        // 7. Initialize the Friend Bar (landing view) — desktops are now sized
        helium.initFriendBar();

        // 8. Flush microtasks
        await Promise.resolve();

        // 9. Start input and render loop
        this.setupMouseEvents();
        this.startRenderLoop();
    }

    /**
     * Disposes the application and cleans up resources.
     */
    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        // Stop render loop
        if(this._animFrameId)
        {
            cancelAnimationFrame(this._animFrameId);
            this._animFrameId = 0;
        }

        // Remove event listeners
        window.removeEventListener('resize', this._onResize);

        if(this._canvas)
        {
            this._canvas.removeEventListener('mousedown', this._onMouseDown);
            this._canvas.removeEventListener('mousemove', this._onMouseMove);
            this._canvas.removeEventListener('mouseup', this._onMouseUp);
            this._canvas.removeEventListener('wheel', this._onWheel);
            this._canvas.removeEventListener('contextmenu', this._onContextMenu);
        }

        if(this._docMoveHandler)
        {
            document.removeEventListener('mousemove', this._docMoveHandler);
        }

        if(this._docUpHandler)
        {
            document.removeEventListener('mouseup', this._docUpHandler);
        }

        // Remove canvas from DOM
        this._canvas?.remove();
        this._canvas = null;
        this._ctx = null;
        this._lastHoveredWindow = null;
        this._mouseDownWindow = null;
    }

    /**
     * Registers all image asset URLs with the engine's ResourceManager.
     *
     * Only registers name→URL mappings (cheap). The ResourceManager will
     * lazily fetch and decode the ImageBitmap on first request from a
     * StaticBitmapWrapperController.
     *
     * @see sources/win63_version/habbo/window/ResourceManager.as
     */
    private registerImageAssets(): void
    {
        const helium = Helium.instance;

        for(const [path, mod] of Object.entries(imageModules))
        {
            // Extract asset name: './assets/images/icons_toolbar_reception_normal.png' → 'icons_toolbar_reception_normal'
            const name = path.split('/').pop()!.replace('.png', '');

            helium.windowManager.registerAssetUrl(name, mod.default);
        }
    }

    /**
     * Creates the canvas element and appends it to the DOM.
     */
    private createCanvas(): void
    {
        const container = document.getElementById('helium-ui');

        if(!container) return;

        // Clear any loading content
        container.innerHTML = '';

        this._canvas = document.createElement('canvas');
        this._canvas.id = 'helium-canvas';
        this._canvas.style.position = 'absolute';
        this._canvas.style.top = '0';
        this._canvas.style.left = '0';
        this._canvas.style.imageRendering = 'pixelated';

        container.appendChild(this._canvas);

        this._ctx = this._canvas.getContext('2d');

        this.resizeCanvas();

        window.addEventListener('resize', this._onResize);
    }

    /** Bound resize handler. */
    private _onResize = (): void =>
    {
        this.resizeCanvas();
    };

    /**
     * Resizes the canvas to match the viewport.
     *
     * Sets the canvas width/height attributes directly to the viewport size.
     * No DPR scaling — the canvas pixel buffer matches CSS pixels 1:1.
     */
    private resizeCanvas(): void
    {
        if(!this._canvas) return;

        const w = window.innerWidth;
        const h = window.innerHeight;

        this._canvas.width = w;
        this._canvas.height = h;

        // Update desktop sizes in each context layer
        const helium = Helium.instance;

        for(let i = 0; i < 4; i++)
        {
            const desktop = helium.windowManager.getDesktop(i);

            if(desktop)
            {
                desktop.width = w;
                desktop.height = h;
            }
        }
    }

    /**
     * Starts the render loop using requestAnimationFrame.
     */
    private startRenderLoop(): void
    {
        const loop = (): void =>
        {
            if(this._disposed) return;

            this.renderFrame();

            this._animFrameId = requestAnimationFrame(loop);
        };

        this._animFrameId = requestAnimationFrame(loop);
    }

    /**
     * Renders a single frame.
     *
     * Renders all dirty windows, composites the full tree,
     * then blits the result onto the DOM canvas.
     */
    private renderFrame(): void
    {
        if(!this._canvas || !this._ctx) return;

        const helium = Helium.instance;
        const windowManager = helium.windowManager;
        const renderer = windowManager.getWindowRenderer();

        if(!renderer) return;

        // Process any pending render queue
        renderer.render();

        // Composite all layers into the buffer
        const w = this._canvas.width;
        const h = this._canvas.height;

        const buffer = windowManager.compositeToBuffer(w, h);

        if(!buffer) return;

        // Blit composite buffer onto the DOM canvas
        const ctx = this._ctx;

        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(buffer, 0, 0);
    }

    /**
     * Sets up mouse event listeners on the canvas.
     */
    private setupMouseEvents(): void
    {
        if(!this._canvas) return;

        this._canvas.addEventListener('mousedown', this._onMouseDown);
        this._canvas.addEventListener('mousemove', this._onMouseMove);
        this._canvas.addEventListener('mouseup', this._onMouseUp);
        this._canvas.addEventListener('wheel', this._onWheel, { passive: true });
        this._canvas.addEventListener('contextmenu', this._onContextMenu);
    }

    /**
     * Converts a DOM mouse event to canvas-local coordinates.
     */
    private getCanvasCoords(e: MouseEvent): { x: number; y: number }
    {
        if(!this._canvas) return { x: 0, y: 0 };

        const rect = this._canvas.getBoundingClientRect();

        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }

    /** Canvas mousedown handler. */
    private _onMouseDown = (e: MouseEvent): void =>
    {
        const { x, y } = this.getCanvasCoords(e);
        const helium = Helium.instance;
        const hit = helium.windowManager.findWindowAtPoint(x, y);

        if(!hit) return;

        this._mouseDown = true;
        this._mouseDownWindow = hit;

        // Compute local coordinates
        const globalPos = { x: 0, y: 0 };

        hit.getGlobalPosition(globalPos);

        const localX = x - globalPos.x;
        const localY = y - globalPos.y;

        const event = WindowMouseEvent.allocateMouse(
            WindowMouseEvent.DOWN, hit, null,
            localX, localY, e.clientX, e.clientY,
            e.altKey, e.ctrlKey, e.shiftKey, true
        );
        (hit as WindowController).update(hit as WindowController, event);
        event.recycle();

        // Register document-level handlers for drag/scale
        const serviceManager = helium.windowManager.getServiceManager();

        if(serviceManager)
        {
            const dragger = serviceManager.getMouseDraggingService() as WindowMouseOperator;
            const scaler = serviceManager.getMouseScalingService() as WindowMouseOperator;

            this._docMoveHandler = (ev: MouseEvent): void =>
            {
                dragger.handleMouseMove(ev.clientX, ev.clientY);
                scaler.handleMouseMove(ev.clientX, ev.clientY);
            };

            this._docUpHandler = (ev: MouseEvent): void =>
            {
                dragger.handleMouseUp();
                scaler.handleMouseUp();

                // Dispatch UP event to window
                if(this._mouseDownWindow)
                {
                    const { x: ux, y: uy } = this.getCanvasCoords(ev);
                    const gp = { x: 0, y: 0 };

                    this._mouseDownWindow.getGlobalPosition(gp);

                    const upEvent = WindowMouseEvent.allocateMouse(
                        WindowMouseEvent.UP, this._mouseDownWindow, null,
                        ux - gp.x, uy - gp.y, ev.clientX, ev.clientY
                    );
                    (this._mouseDownWindow as WindowController).update(
                        this._mouseDownWindow as WindowController, upEvent
                    );
                    upEvent.recycle();
                }

                this._mouseDown = false;
                this._mouseDownWindow = null;

                document.removeEventListener('mousemove', this._docMoveHandler!);
                document.removeEventListener('mouseup', this._docUpHandler!);
                this._docMoveHandler = null;
                this._docUpHandler = null;
            };

            document.addEventListener('mousemove', this._docMoveHandler);
            document.addEventListener('mouseup', this._docUpHandler);
        }
    };

    /** Canvas mousemove handler. */
    private _onMouseMove = (e: MouseEvent): void =>
    {
        const { x, y } = this.getCanvasCoords(e);
        const helium = Helium.instance;
        const hit = helium.windowManager.findWindowAtPoint(x, y);

        // Hover tracking: OVER/OUT
        if(hit !== this._lastHoveredWindow)
        {
            // Send OUT to the old window
            if(this._lastHoveredWindow && !this._lastHoveredWindow.disposed)
            {
                const outEvent = WindowMouseEvent.allocateMouse(
                    WindowMouseEvent.OUT, this._lastHoveredWindow, hit,
                    0, 0, e.clientX, e.clientY
                );
                (this._lastHoveredWindow as WindowController).update(
                    this._lastHoveredWindow as WindowController, outEvent
                );
                outEvent.recycle();
            }

            // Send OVER to the new window
            if(hit)
            {
                const globalPos = { x: 0, y: 0 };

                hit.getGlobalPosition(globalPos);

                const overEvent = WindowMouseEvent.allocateMouse(
                    WindowMouseEvent.OVER, hit, this._lastHoveredWindow,
                    x - globalPos.x, y - globalPos.y, e.clientX, e.clientY
                );
                (hit as WindowController).update(hit as WindowController, overEvent);
                overEvent.recycle();
            }

            this._lastHoveredWindow = hit;
        }

        // Send MOVE event to the hovered window
        if(hit)
        {
            const globalPos = { x: 0, y: 0 };

            hit.getGlobalPosition(globalPos);

            const moveEvent = WindowMouseEvent.allocateMouse(
                WindowMouseEvent.MOVE, hit, null,
                x - globalPos.x, y - globalPos.y, e.clientX, e.clientY
            );
            (hit as WindowController).update(hit as WindowController, moveEvent);
            moveEvent.recycle();
        }
    };

    /** Canvas mouseup handler (fallback for non-drag scenarios). */
    private _onMouseUp = (e: MouseEvent): void =>
    {
        // If doc-level handlers are active, they handle the UP
        if(this._docUpHandler) return;

        const { x, y } = this.getCanvasCoords(e);
        const helium = Helium.instance;
        const hit = helium.windowManager.findWindowAtPoint(x, y);

        if(!hit) return;

        const globalPos = { x: 0, y: 0 };

        hit.getGlobalPosition(globalPos);

        const event = WindowMouseEvent.allocateMouse(
            WindowMouseEvent.UP, hit, null,
            x - globalPos.x, y - globalPos.y, e.clientX, e.clientY
        );
        (hit as WindowController).update(hit as WindowController, event);
        event.recycle();
    };

    /** Canvas wheel handler. */
    private _onWheel = (e: WheelEvent): void =>
    {
        const { x, y } = this.getCanvasCoords(e);
        const helium = Helium.instance;
        const hit = helium.windowManager.findWindowAtPoint(x, y);

        if(!hit) return;

        const globalPos = { x: 0, y: 0 };

        hit.getGlobalPosition(globalPos);

        const event = WindowMouseEvent.allocateMouse(
            WindowMouseEvent.WHEEL, hit, null,
            x - globalPos.x, y - globalPos.y, e.clientX, e.clientY,
            e.altKey, e.ctrlKey, e.shiftKey, false,
            e.deltaY
        );
        (hit as WindowController).update(hit as WindowController, event);
        event.recycle();
    };

    /** Prevent right-click context menu on the canvas. */
    private _onContextMenu = (e: Event): void =>
    {
        e.preventDefault();
    };

    private unwrapDefault<T>(mod: any): T
    {
        return 'default' in mod ? mod.default : mod;
    }
}
