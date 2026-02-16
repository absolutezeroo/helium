import type {IHeliumConfig} from 'helium-engine';
import {Helium} from 'helium-engine';
import {HabboToolbarEnum} from '@habbo/toolbar/HabboToolbarEnum';
import type {ISkinData} from '@core/window';
import type {IWindow} from '@core/window/IWindow';
import {WindowController} from '@core/window/WindowController';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {WindowMouseOperator} from '@core/window/services/WindowMouseOperator';
import type {IElementDescriptionData} from '@habbo/window';
import type {HeliumLoadingScreen} from './HeliumLoadingScreen';
import {AssetBundle} from './AssetBundle';
import './_index.scss';

/** Atlas spritesheet names that need to be decoded as ImageBitmaps. */
const ATLAS_NAMES = [
	'habbo_blue_skin',
	'habbo_skin_ubuntu',
	'habbo_skin_illumina_dark',
	'habbo_skin_illumina_light',
	'habbo_icons',
	'skin_ubuntu_bg_9',
];

declare global
{
	interface Window
	{
		HeliumConfig?: IHeliumConfig;
	}
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
	private _loadingScreen: HeliumLoadingScreen | null;
	private _bundle: AssetBundle | null = null;

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

	constructor(loadingScreen?: HeliumLoadingScreen)
	{
		this._loadingScreen = loadingScreen ?? null;
	}

	/**
	 * Initializes the application.
	 *
	 * Bootstraps the engine, loads the asset bundle, configures skins/layouts,
	 * creates the canvas, and starts the render loop.
	 *
	 * @see sources/win63_2021_version/HabboAir.as
	 */
	public async init(): Promise<void>
	{
		// 1. Bootstrap engine + load asset bundle in parallel
		// AS3: HabboAir passes loadingScreen to HabboAirMain.
		// Asset loading progress maps to [0.0 - 0.6] range (AS3: SWF preloading).
		// Engine init progress maps to [0.6 - 1.0] range (AS3: HabboAirMain.updateProgressBar).
		const CORE_RATIO = 0.6;

		const [, bundle] = await Promise.all([
			Helium.bootstrap(window.HeliumConfig, this._loadingScreen ?? undefined).catch(error =>
			{
				console.warn('[HeliumApp] Bootstrap error (connection may have failed):', error);
			}),
			AssetBundle.load('/assets.bundle', (ratio: number) =>
			{
				this._loadingScreen?.updateLoadingBar(ratio * CORE_RATIO);
			}),
		]);

		this._bundle = bundle;

		const helium = Helium.instance;

		// 2. Load element descriptions + atlas bitmaps from bundle
		try
		{
			const elementDescription = bundle.getJson<IElementDescriptionData>(
				'window-skins/element-description.json'
			);

			if (elementDescription)
			{
				helium.windowManager.loadElementDescription(elementDescription);
			}

			// Decode atlas spritesheets as ImageBitmaps
			const bitmaps = await Promise.all(
				ATLAS_NAMES.map(name => bundle.getImageBitmap(`images/${name}.png`))
			);

			const atlases = new Map<string, ImageBitmap>();

			for (let i = 0; i < ATLAS_NAMES.length; i++)
			{
				const bmp = bitmaps[i];

				if (bmp) atlases.set(ATLAS_NAMES[i], bmp);
			}

			// Load all skin JSONs from bundle
			const skins = new Map<string, ISkinData>();

			for (const key of bundle.listKeys('window-skins/habbo_skin_'))
			{
				const skin = bundle.getJson<ISkinData>(key);

				if (skin) skins.set(skin.id, skin);
			}

			helium.windowManager.loadSkinAssets(skins, atlases);
		}
		catch (error)
		{
			console.warn('[HeliumApp] Failed to load skin/element assets:', error);
		}

		// 3. Register all window layouts from bundle
		for (const key of bundle.listKeys('window-layouts/'))
		{
			const name = key.split('/').pop()!.replace('.json', '');
			const layout = bundle.getJson(key);

			if (layout)
			{
				helium.windowManager.registerWidgetLayout(name, layout);
			}
		}

		// 4. Dispose loading screen before creating canvas (prevents white flash)
		if (this._loadingScreen)
		{
			this._loadingScreen.dispose();
			this._loadingScreen = null;
		}

		// 5. Create the canvas and set desktop sizes BEFORE creating windows
		this.createCanvas();

		// 6. Register all image blob URLs with the resource manager
		this.registerImageAssets();

		// 7. Initialize the Friend Bar (landing view) — desktops are now sized
		helium.initFriendBar();

		// 8. Activate the toolbar (hotel view by default)
		helium.toolbar.setToolbarState(HabboToolbarEnum.TOOLBAR_STATE_HOTEL_VIEW);

		// 9. Flush microtasks
		await Promise.resolve();

		// 10. Start input and render loop
		this.setupMouseEvents();
		this.startRenderLoop();
	}

	/**
	 * Disposes the application and cleans up resources.
	 */
	public dispose(): void
	{
		if (this._disposed) return;

		this._disposed = true;

		// Stop render loop
		if (this._animFrameId)
		{
			cancelAnimationFrame(this._animFrameId);
			this._animFrameId = 0;
		}

		// Remove event listeners
		window.removeEventListener('resize', this._onResize);

		if (this._canvas)
		{
			this._canvas.removeEventListener('mousedown', this._onMouseDown);
			this._canvas.removeEventListener('mousemove', this._onMouseMove);
			this._canvas.removeEventListener('mouseup', this._onMouseUp);
			this._canvas.removeEventListener('wheel', this._onWheel);
			this._canvas.removeEventListener('contextmenu', this._onContextMenu);
		}

		if (this._docMoveHandler)
		{
			document.removeEventListener('mousemove', this._docMoveHandler);
		}

		if (this._docUpHandler)
		{
			document.removeEventListener('mouseup', this._docUpHandler);
		}

		// Revoke blob URLs
		if (this._bundle)
		{
			this._bundle.dispose();
			this._bundle = null;
		}

		// Remove canvas from DOM
		this._canvas?.remove();
		this._canvas = null;
		this._ctx = null;
		this._lastHoveredWindow = null;
		this._mouseDownWindow = null;
	}

	/**
	 * Registers all image asset blob URLs with the engine's ResourceManager.
	 *
	 * Creates blob URLs from the bundle for each PNG image and registers
	 * them with the WindowManager. The ResourceManager will lazily decode
	 * the ImageBitmap on first request.
	 *
	 * @see sources/win63_version/habbo/window/ResourceManager.as
	 */
	private registerImageAssets(): void
	{
		if (!this._bundle) return;

		const helium = Helium.instance;

		for (const key of this._bundle.listKeys('images/'))
		{
			// Extract asset name: 'images/icons_toolbar_reception_normal.png' → 'icons_toolbar_reception_normal'
			const name = key.split('/').pop()!.replace('.png', '');
			const url = this._bundle.getUrl(key);

			if (url)
			{
				helium.windowManager.registerAssetUrl(name, url);
			}
		}
	}

	/**
	 * Creates the canvas element and appends it to the DOM.
	 */
	private createCanvas(): void
	{
		const container = document.getElementById('helium-ui');

		if (!container) return;

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
		if (!this._canvas) return;

		const w = window.innerWidth;
		const h = window.innerHeight;

		this._canvas.width = w;
		this._canvas.height = h;

		// Update desktop sizes in each context layer
		const helium = Helium.instance;

		for (let i = 0; i < 4; i++)
		{
			const desktop = helium.windowManager.getDesktop(i);

			if (desktop)
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
			if (this._disposed) return;

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
		if (!this._canvas || !this._ctx) return;

		const helium = Helium.instance;
		const windowManager = helium.windowManager;
		const renderer = windowManager.getWindowRenderer();

		if (!renderer) return;

		// Process any pending render queue
		renderer.render();

		// Composite all layers into the buffer
		const w = this._canvas.width;
		const h = this._canvas.height;

		const buffer = windowManager.compositeToBuffer(w, h);

		if (!buffer) return;

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
		if (!this._canvas) return;

		this._canvas.addEventListener('mousedown', this._onMouseDown);
		this._canvas.addEventListener('mousemove', this._onMouseMove);
		this._canvas.addEventListener('mouseup', this._onMouseUp);
		this._canvas.addEventListener('wheel', this._onWheel, {passive: true});
		this._canvas.addEventListener('contextmenu', this._onContextMenu);
	}

	/**
	 * Converts a DOM mouse event to canvas-local coordinates.
	 */
	private getCanvasCoords(e: MouseEvent): { x: number; y: number }
	{
		if (!this._canvas) return {x: 0, y: 0};

		const rect = this._canvas.getBoundingClientRect();

		return {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
		};
	}

	/** Canvas mousedown handler. */
	private _onMouseDown = (e: MouseEvent): void =>
	{
		const {x, y} = this.getCanvasCoords(e);
		const helium = Helium.instance;
		const hit = helium.windowManager.findWindowAtPoint(x, y);

		if (!hit) return;

		this._mouseDown = true;
		this._mouseDownWindow = hit;

		// Pre-seed drag/scale services with current canvas-local coords
		// so that begin() (triggered inside update() below) computes the correct offset.
		const serviceManager = helium.windowManager.getServiceManager();

		if (serviceManager)
		{
			(serviceManager.getMouseDraggingService() as WindowMouseOperator).setMousePosition(x, y);
			(serviceManager.getMouseScalingService() as WindowMouseOperator).setMousePosition(x, y);
		}

		// Compute local coordinates
		const globalPos = {x: 0, y: 0};

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
		if (serviceManager)
		{
			const dragger = serviceManager.getMouseDraggingService() as WindowMouseOperator;
			const scaler = serviceManager.getMouseScalingService() as WindowMouseOperator;

			this._docMoveHandler = (ev: MouseEvent): void =>
			{
				const coords = this.getCanvasCoords(ev);

				dragger.handleMouseMove(coords.x, coords.y);
				scaler.handleMouseMove(coords.x, coords.y);
			};

			this._docUpHandler = (ev: MouseEvent): void =>
			{
				dragger.handleMouseUp();
				scaler.handleMouseUp();

				// Dispatch UP event to window
				if (this._mouseDownWindow)
				{
					const {x: ux, y: uy} = this.getCanvasCoords(ev);
					const gp = {x: 0, y: 0};

					this._mouseDownWindow.getGlobalPosition(gp);

					const upEvent = WindowMouseEvent.allocateMouse(
						WindowMouseEvent.UP, this._mouseDownWindow, null,
						ux - gp.x, uy - gp.y, ev.clientX, ev.clientY
					);
					(this._mouseDownWindow as WindowController).update(
						this._mouseDownWindow as WindowController, upEvent
					);
					upEvent.recycle();

					// Synthesize CLICK if mouseup is on same window as mousedown
					const clickHit = helium.windowManager.findWindowAtPoint(ux, uy);

					if (clickHit)
					{
						const cp = {x: 0, y: 0};

						clickHit.getGlobalPosition(cp);

						const clickEvent = WindowMouseEvent.allocateMouse(
							WindowMouseEvent.CLICK, clickHit, null,
							ux - cp.x, uy - cp.y, ev.clientX, ev.clientY
						);
						(clickHit as WindowController).update(clickHit as WindowController, clickEvent);
						clickEvent.recycle();
					}
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
		const {x, y} = this.getCanvasCoords(e);
		const helium = Helium.instance;
		const hit = helium.windowManager.findWindowAtPoint(x, y);

		// Hover tracking: OVER/OUT
		if (hit !== this._lastHoveredWindow)
		{
			// Send OUT to the old window
			if (this._lastHoveredWindow && !this._lastHoveredWindow.disposed)
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
			if (hit)
			{
				const globalPos = {x: 0, y: 0};

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
		if (hit)
		{
			const globalPos = {x: 0, y: 0};

			hit.getGlobalPosition(globalPos);

			const moveEvent = WindowMouseEvent.allocateMouse(
				WindowMouseEvent.MOVE, hit, null,
				x - globalPos.x, y - globalPos.y, e.clientX, e.clientY
			);
			(hit as WindowController).update(hit as WindowController, moveEvent);
			moveEvent.recycle();
		}

		// Update cursor: pointer on mouse-event-enabled windows
		if (this._canvas)
		{
			this._canvas.style.cursor = (hit && hit.testParamFlag(1)) ? 'pointer' : 'default';
		}
	};

	/** Canvas mouseup handler (fallback for non-drag scenarios). */
	private _onMouseUp = (e: MouseEvent): void =>
	{
		// If doc-level handlers are active, they handle the UP
		if (this._docUpHandler) return;

		const {x, y} = this.getCanvasCoords(e);
		const helium = Helium.instance;
		const hit = helium.windowManager.findWindowAtPoint(x, y);

		if (!hit) return;

		const globalPos = {x: 0, y: 0};

		hit.getGlobalPosition(globalPos);

		const upEvent = WindowMouseEvent.allocateMouse(
			WindowMouseEvent.UP, hit, null,
			x - globalPos.x, y - globalPos.y, e.clientX, e.clientY
		);
		(hit as WindowController).update(hit as WindowController, upEvent);
		upEvent.recycle();

		// Synthesize CLICK
		const clickEvent = WindowMouseEvent.allocateMouse(
			WindowMouseEvent.CLICK, hit, null,
			x - globalPos.x, y - globalPos.y, e.clientX, e.clientY
		);
		(hit as WindowController).update(hit as WindowController, clickEvent);
		clickEvent.recycle();
	};

	/** Canvas wheel handler. */
	private _onWheel = (e: WheelEvent): void =>
	{
		const {x, y} = this.getCanvasCoords(e);
		const helium = Helium.instance;
		const hit = helium.windowManager.findWindowAtPoint(x, y);

		if (!hit) return;

		const globalPos = {x: 0, y: 0};

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
}
