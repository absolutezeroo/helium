import {EventEmitter} from 'eventemitter3';
import {Component} from '@core/runtime/Component';
import {Logger} from '@core/utils/Logger';
import {WindowLayoutParser} from './WindowLayoutParser';
import {ElementRegistry} from './ElementRegistry';
import {WindowContextLayer} from './enum/WindowContextLayer';
import type {IHabboWindowManager} from './IHabboWindowManager';
import {WindowManagerEvents} from './IHabboWindowManager';
import type {IWindowInstance} from './IWindowInstance';
import type {IWindowLayout} from './IWindowLayout';
import type {IElementDescriptionData} from './IElementDescriptor';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContext} from '@core/window/IWindowContext';
import type {IInputEventTracker} from '@core/window/IInputEventTracker';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWindowFactory} from '@core/window/IWindowFactory';
import type {IThemeManager} from '@core/window/theme/IThemeManager';
import {WindowContext} from '@core/window/WindowContext';
import {Classes} from '@core/window/Classes';
import {WindowType} from '@core/window/enum/WindowType';
import {DesktopController} from '@core/window/components/DesktopController';
import {WindowParser} from '@core/window/utils/WindowParser';
import {SkinContainer} from '@core/window/graphics/SkinContainer';
import {WindowRenderer} from '@core/window/graphics/WindowRenderer';
import {FillSkinRenderer} from '@core/window/graphics/renderer/FillSkinRenderer';
import {NullSkinRenderer} from '@core/window/graphics/renderer/NullSkinRenderer';
import type {ISkinData} from '@core/window/graphics/renderer/BitmapSkinParser';
import {BitmapSkinParser} from '@core/window/graphics/renderer/BitmapSkinParser';
import {DefaultAttStruct} from '@core/window/utils/DefaultAttStruct';
import {ThemeManager} from './theme/ThemeManager';
import {ServiceManager} from '@core/window/services/ServiceManager';
import {HabboWidgetFactory} from './HabboWidgetFactory';
import {ComponentDependency} from '@core/runtime/ComponentDependency';
import {IID_AvatarRenderManager} from '@iid/IIDAvatarRenderManager';
import {IID_HabboCommunicationManager} from '@iid/IIDHabboCommunicationManager';
import type {IAvatarRenderManager} from '@habbo/avatar/IAvatarRenderManager';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {IContext} from '@core/runtime/IContext';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IModalDialog} from './utils/IModalDialog';
import {ModalDialog} from './utils/ModalDialog';
import {ResourceManager} from './ResourceManager';

const log = Logger.getLogger('HabboWindowManager');

/**
 * Habbo Window Manager Component.
 *
 * Manages the lifecycle of declarative windows AND provides the AS3-compatible
 * ICoreWindowManager + IHabboWindowManager API. This is the central orchestrator
 * of the window system.
 *
 * In AS3, this class extended Component and implemented IHabboWindowManager,
 * ICoreWindowManager, IWindowFactory, IUpdateReceiver, IInputEventTracker,
 * and IWidgetFactory. It managed 4 WindowContexts (one per layer), a
 * WindowRenderer, SkinContainer, ThemeManager, and ResourceManager.
 *
 * Uses a separate `_windowEvents` emitter (NOT `events`) to avoid
 * the Component DI override bug.
 *
 * @see sources/win63_2021_version/com/sulake/habbo/window/HabboWindowManagerComponent.as
 */
export class HabboWindowManager extends Component implements IHabboWindowManager
{
	private static readonly NUMBER_OF_CONTEXT_LAYERS: number = 4;
	private static readonly DEFAULT_CONTEXT_LAYER_INDEX: number = 1;

	private _windows: Map<number, IWindowInstance> = new Map();
	private _layouts: Map<string, IWindowLayout> = new Map();
	private _nextId: number = 1;
	private _skinContainer: SkinContainer = new SkinContainer();
	private _themeManager: ThemeManager | null = null;
	private _windowContextArray: IWindowContext[] = [];
	private _defaultContext: IWindowContext | null = null;

	private _widgetLayouts: Map<string, unknown> = new Map();

	private _windowRenderer: WindowRenderer | null = null;
	private _serviceManager: ServiceManager | null = null;
	private _resourceManager: ResourceManager | null = null;
	private _initialized: boolean = false;

	constructor(context: IContext, flags: number = 0, assetLibrary: IAssetLibrary | null = null)
	{
		super(context, flags, assetLibrary);

		this.initContexts();
	}

	private _avatarRenderer: IAvatarRenderManager | null = null;

	/**
	 * The avatar render manager.
	 *
	 * In AS3: HabboWindowManagerComponent.avatarRenderer
	 */
	public get avatarRenderer(): IAvatarRenderManager | null
	{
		return this._avatarRenderer;
	}

	private _communication: IHabboCommunicationManager | null = null;

	/**
	 * The communication manager.
	 *
	 * In AS3: HabboWindowManagerComponent.communication
	 */
	public get communication(): IHabboCommunicationManager | null
	{
		return this._communication;
	}

	private _windowEvents: EventEmitter = new EventEmitter();

	/**
	 * Event emitter for window lifecycle events.
	 */
	get windowEvents(): EventEmitter
	{
		return this._windowEvents;
	}

	private _elementRegistry: ElementRegistry = new ElementRegistry();

	/**
	 * The element registry.
	 */
	get elementRegistry(): ElementRegistry
	{
		return this._elementRegistry;
	}

	protected override get dependencies(): Array<ComponentDependency<any>>
	{
		return [
			new ComponentDependency(
				IID_AvatarRenderManager,
				(renderer: IAvatarRenderManager | null) =>
				{
					this._avatarRenderer = renderer;
				},
				false // optional — window manager can work without avatar renderer
			),
			new ComponentDependency(
				IID_HabboCommunicationManager,
				(manager: IHabboCommunicationManager | null) =>
				{
					this._communication = manager;
				},
				false // optional — window manager can work without communication
			),
		];
	}

	/**
	 * Load element description data into the registry.
	 */
	loadElementDescription(data: IElementDescriptionData): void
	{
		this._elementRegistry.load(data);

		// Populate SkinContainer from element descriptors
		for (const element of data.elements)
		{
			if (element.typeId < 0) continue;

			const defaults = new DefaultAttStruct(
				element.defaults.blend,
				element.defaults.threshold,
				element.defaults.background,
				element.defaults.color,
				element.defaults.widthMin,
				element.defaults.widthMax,
				element.defaults.heightMin,
				element.defaults.heightMax
			);

			const rendererType = element.renderer || 'null';
			const rendererName = `${element.typeId}_${element.style}`;
			const renderer = rendererType === 'fill'
				? new FillSkinRenderer(rendererName)
				: new NullSkinRenderer(rendererName);

			this._skinContainer.addSkinRenderer(
				element.typeId,
				element.style,
				element.intent,
				renderer,
				null,
				defaults
			);
		}

		// Create ThemeManager now that SkinContainer is populated
		this._themeManager = new ThemeManager(this._skinContainer);

		log.info(`Element registry loaded: ${data.elements.length} descriptors, ThemeManager initialized`);
	}

	/**
	 * Register a layout by name.
	 */
	registerLayout(name: string, layout: IWindowLayout): void
	{
		this._layouts.set(name, layout);
		log.debug(`Layout registered: ${name}`);
	}

	/**
	 * Get a registered layout by name.
	 */
	getLayout(name: string): IWindowLayout | null
	{
		return this._layouts.get(name) ?? null;
	}

	/**
	 * Open a window from a layout.
	 */
	openWindow(layout: IWindowLayout, vars?: Record<string, unknown>, layer: number = WindowContextLayer.DEFAULT): IWindowInstance
	{
		const resolvedTree = WindowLayoutParser.resolve(layout, vars);

		const instance: IWindowInstance = {
			id: this._nextId++,
			layoutName: layout.name,
			layer,
			layoutTree: resolvedTree,
			visible: true,
			zOrder: this.getMaxZOrder(layer) + 1,
			vars: vars ?? {},
		};

		this._windows.set(instance.id, instance);

		log.debug(`Window opened: ${layout.name} (id=${instance.id}, layer=${layer})`);

		this._windowEvents.emit(WindowManagerEvents.WINDOW_OPEN, instance);

		return instance;
	}

	/**
	 * Close a window by ID.
	 */
	closeWindow(id: number): void
	{
		const instance = this._windows.get(id);

		if (!instance) return;

		this._windows.delete(id);

		log.debug(`Window closed: ${instance.layoutName} (id=${id})`);

		this._windowEvents.emit(WindowManagerEvents.WINDOW_CLOSE, instance);
	}

	/**
	 * Get a window by ID.
	 */
	getWindow(id: number): IWindowInstance | null
	{
		return this._windows.get(id) ?? null;
	}

	/**
	 * Get all open windows, optionally filtered by layer.
	 */
	getWindows(layer?: number): IWindowInstance[]
	{
		const all = Array.from(this._windows.values());

		if (layer !== undefined)
		{
			return all.filter((w) => w.layer === layer);
		}

		return all;
	}

	/**
	 * Create a window using the core factory.
	 *
	 * In AS3: create(name, type, style, param, rect, procedure, dynamicStyle, id, tags, parent, properties)
	 * Delegates to the default context layer.
	 */
	public create(
		name: string,
		type: number,
		style: number,
		param: number,
		rect: { x: number; y: number; width: number; height: number },
		procedure?: ((event: unknown, window: IWindow) => void) | null,
		dynamicStyle?: string,
		id?: number,
		tags?: string[] | null,
		parent?: IWindow | null,
		properties?: unknown[] | null
	): IWindow
	{
		return this._defaultContext!.create(
			name, '', type, style, param, rect,
			procedure ?? null, parent ?? null,
			id ?? 0, tags ?? null, dynamicStyle ?? '', properties ?? null
		);
	}

	/**
	 * Destroy a window.
	 */
	public destroy(window: IWindow): void
	{
		window.destroy();
	}

	/**
	 * Build a window tree from a JSON layout definition.
	 *
	 * In AS3 this was buildFromXML. We use JSON instead.
	 */
	public buildFromJSON(json: unknown, layer: number = 1, _vars?: Map<string, string> | null): IWindow
	{
		const context = this.getWindowContext(layer);
		const parser = context.getWindowParser();
		const desktop = context.getDesktopWindow();

		if (parser && desktop)
		{
			return parser.parseAndConstruct(json as Record<string, unknown>, desktop, null) as IWindow;
		}

		throw new Error('Window parser or desktop not available');
	}

	/**
	 * Register a widget layout JSON asset by name.
	 *
	 * In AS3, widget layouts were stored as XML assets in the SWF asset library.
	 * Here we register JSON layout objects by name so widgets can build their
	 * internal window trees via buildWidgetLayout().
	 *
	 * @param name - The layout asset name (e.g. "hover_bitmap", "avatar_image")
	 * @param json - The JSON layout object
	 */
	public registerWidgetLayout(name: string, json: unknown): void
	{
		this._widgetLayouts.set(name, json);
	}

	/**
	 * Build a widget's internal window tree from a registered layout asset.
	 *
	 * Equivalent to AS3:
	 * `buildFromXML(assets.getAssetByName("widget_xml").content as XML)`
	 *
	 * @param name - The layout asset name
	 * @param layer - Context layer (default 1)
	 * @returns The root IWindow of the built tree, or null
	 */
	public buildWidgetLayout(name: string, layer: number = 1): IWindow | null
	{
		const json = this._widgetLayouts.get(name);

		if (!json)
		{
			log.warn(`Widget layout not found: ${name}`);

			return null;
		}

		return this.buildFromJSON(json, layer);
	}

	/**
	 * Build a modal dialog from a JSON layout definition.
	 *
	 * Creates a dimmed background overlay and a centered content
	 * window. Delegates to ModalDialog which manages the shared
	 * modal container.
	 *
	 * In AS3: buildModalDialogFromXML(xml: XML): IModalDialog
	 */
	public buildModalDialogFromJSON(json: unknown): IModalDialog
	{
		return new ModalDialog(this, json);
	}

	/**
	 * Create a window by name, type, style, param in a given context layer.
	 *
	 * In AS3: createWindow(name, caption, type, style, param, rect, procedure, id, layer, dynamicStyle)
	 */
	public createWindow(
		name: string,
		caption: string = '',
		type: number = 0,
		style: number = 0,
		param: number = 0,
		rect: { x: number; y: number; width: number; height: number } | null = null,
		procedure: ((event: unknown, window: IWindow) => void) | null = null,
		id: number = 0,
		layer: number = 1,
		dynamicStyle: string = ''
	): IWindow
	{
		const effectiveRect = rect ?? {x: 0, y: 0, width: 0, height: 0};

		return this._windowContextArray[layer].create(
			name, caption, type, style, param, effectiveRect,
			procedure, null, id, null, dynamicStyle, null
		);
	}

	/**
	 * Remove a window by name from a context layer.
	 */
	public removeWindow(name: string, layer: number = 1): void
	{
		const desktop = this._windowContextArray[layer]?.getDesktopWindow();

		if (!desktop) return;

		const child = (desktop as IWindowContainer).getChildByName?.(name) ?? null;

		if (child)
		{
			child.destroy();
		}
	}

	/**
	 * Get a window by name from a context layer.
	 */
	public getWindowByName(name: string, layer: number = 1): IWindow | null
	{
		const desktop = this._windowContextArray[layer]?.getDesktopWindow();

		if (!desktop) return null;

		return (desktop as IWindowContainer).getChildByName?.(name) ?? null;
	}

	/**
	 * Get the topmost active window in a context layer.
	 */
	public getActiveWindow(layer: number = 1): IWindow | null
	{
		const desktop = this._windowContextArray[layer]?.getDesktopWindow();

		if (!desktop) return null;

		const container = desktop as IWindowContainer;
		const count = container.numChildren;

		if (count <= 0) return null;

		return container.getChildAt(count - 1);
	}

	/**
	 * Toggle fullscreen mode.
	 */
	public toggleFullScreen(): void
	{
		if (document.fullscreenElement)
		{
			document.exitFullscreen();
		}
		else
		{
			document.documentElement.requestFullscreen();
		}
	}

	/**
	 * Get a window context by layer index.
	 */
	public getWindowContext(layer: number): IWindowContext
	{
		return this._windowContextArray[layer];
	}

	/**
	 * Get the desktop window for a given context layer.
	 */
	public getDesktop(layer: number): IWindow | null
	{
		const context = this._windowContextArray[layer];

		return context ? context.getDesktopWindow() : null;
	}

	/**
	 * Search for a window by name across all context layers.
	 */
	public findWindowByName(name: string): IWindow | null
	{
		for (const context of this._windowContextArray)
		{
			const found = context.findWindowByName(name);

			if (found) return found;
		}

		return null;
	}

	/**
	 * Search for a window by tag across all context layers.
	 */
	public findWindowByTag(tag: string): IWindow | null
	{
		for (const context of this._windowContextArray)
		{
			const found = context.findWindowByTag(tag);

			if (found) return found;
		}

		return null;
	}

	/**
	 * Add an input event tracker to all context layers.
	 */
	public addMouseEventTracker(tracker: IInputEventTracker): void
	{
		for (const context of this._windowContextArray)
		{
			context.addMouseEventTracker(tracker);
		}
	}

	/**
	 * Remove an input event tracker from all context layers.
	 */
	public removeMouseEventTracker(tracker: IInputEventTracker): void
	{
		for (const context of this._windowContextArray)
		{
			context.removeMouseEventTracker(tracker);
		}
	}

	/**
	 * Register a localization parameter.
	 */
	public registerLocalizationParameter(_key: string, _parameter: string, _value: string, _delimiter: string = '%'): void
	{
		// Localization integration - to be connected when IHabboLocalizationManager is available
	}

	/**
	 * Create an unseen item counter widget.
	 */
	public createUnseenItemCounter(): IWindowContainer | null
	{
		// Requires asset system integration
		return null;
	}

	/**
	 * Register a hint window.
	 */
	public registerHintWindow(_hintId: string, _window: IWindow, _direction: number = 1): void
	{
		// HintManager integration - to be connected
	}

	/**
	 * Unregister a hint window.
	 */
	public unregisterHintWindow(_hintId: string): void
	{
		// HintManager integration - to be connected
	}

	/**
	 * Show a hint by ID.
	 */
	public showHint(_hintId: string, _rect?: { x: number; y: number; width: number; height: number } | null): void
	{
		// HintManager integration - to be connected
	}

	/**
	 * Hide the current hint.
	 */
	public hideHint(): void
	{
		// HintManager integration - to be connected
	}

	/**
	 * Hide a hint matching the given ID.
	 */
	public hideMatchingHint(_hintId: string): void
	{
		// HintManager integration - to be connected
	}

	/**
	 * Open a help page.
	 */
	public openHelpPage(_pageId: string): void
	{
		// HabboPagesViewer integration - to be connected
	}

	/**
	 * Display the floor plan editor.
	 */
	public displayFloorPlanEditor(): void
	{
		// BCFloorPlanEditor integration - to be connected
	}

	/**
	 * Composites all window layers into a single OffscreenCanvas buffer.
	 *
	 * Delegates to WindowRenderer.composite() with the full context array.
	 *
	 * @param width - The target buffer width
	 * @param height - The target buffer height
	 * @returns The composited buffer, or null if renderer is unavailable
	 */
	public compositeToBuffer(width: number, height: number): OffscreenCanvas | null
	{
		if (!this._windowRenderer) return null;

		return this._windowRenderer.composite(this._windowContextArray, width, height);
	}

	/**
	 * Finds the deepest visible window at the given screen point.
	 *
	 * Delegates to WindowRenderer.findWindowAtPoint() with the full context array.
	 *
	 * @param x - The global X coordinate
	 * @param y - The global Y coordinate
	 * @returns The deepest window at the point, or null
	 */
	public findWindowAtPoint(x: number, y: number): IWindow | null
	{
		if (!this._windowRenderer) return null;

		return this._windowRenderer.findWindowAtPoint(this._windowContextArray, x, y);
	}

	/**
	 * Returns the shared service manager for mouse drag/scale operations.
	 *
	 * Used by the client renderer to forward DOM mouse events.
	 */
	public getServiceManager(): ServiceManager | null
	{
		return this._serviceManager;
	}

	/**
	 * Returns the theme manager.
	 *
	 * @returns The theme manager instance
	 */
	public getThemeManager(): IThemeManager
	{
		return this._themeManager!;
	}

	/**
	 * Registers a bitmap asset with the resource manager.
	 *
	 * Called by the client layer after loading images. Assets registered
	 * here are available to StaticBitmapWrapperController via `assetUri`.
	 *
	 * @param name - The asset name
	 * @param bitmap - The decoded ImageBitmap
	 */
	public registerAsset(name: string, bitmap: ImageBitmap): void
	{
		if (this._resourceManager)
		{
			this._resourceManager.registerAsset(name, bitmap);
		}
	}

	/**
	 * Registers an asset URL for lazy loading.
	 *
	 * @param name - The asset name
	 * @param url - The URL to fetch the image from
	 */
	public registerAssetUrl(name: string, url: string): void
	{
		if (this._resourceManager)
		{
			this._resourceManager.registerAssetUrl(name, url);
		}
	}

	/**
	 * Returns the default attributes for a given window type and style.
	 *
	 * @param type - The window type
	 * @param style - The window style
	 * @returns The default attributes, or null
	 */
	public getDefaultsByTypeAndStyle(type: number, style: number): DefaultAttStruct | null
	{
		return this._skinContainer.getDefaultAttributesByTypeAndStyle(type, style);
	}

	/**
	 * Returns the window layout for a given type and style.
	 *
	 * @param type - The window type
	 * @param style - The window style
	 * @returns The layout object, or null
	 */
	public getLayoutByTypeAndStyle(type: number, style: number): Record<string, unknown> | null
	{
		return this._skinContainer.getWindowLayoutByTypeAndStyle(type, style);
	}

	/**
	 * Returns the skin container.
	 *
	 * @returns The skin container instance
	 */
	public getSkinContainer(): SkinContainer
	{
		return this._skinContainer;
	}

	/**
	 * Returns the window renderer.
	 *
	 * @returns The window renderer instance, or null
	 */
	public getWindowRenderer(): WindowRenderer | null
	{
		return this._windowRenderer;
	}

	/**
	 * Loads skin assets and creates BitmapSkinRenderers from skin JSON data.
	 *
	 * For each skin JSON, the parser creates a BitmapSkinRenderer with all
	 * templates, layouts, and state mappings. The renderer is then registered
	 * in the SkinContainer, replacing the NullSkinRenderer placeholder
	 * created during loadElementDescription().
	 *
	 * The skin map is keyed by the skin's `id` field (e.g. "habbo_skin_frame"),
	 * which matches the element descriptor's `asset` field.
	 *
	 * @param skins - Map of skin id → skin JSON data
	 * @param atlases - Map of atlas asset name → ImageBitmap
	 */
	public loadSkinAssets(skins: Map<string, ISkinData>, atlases: Map<string, ImageBitmap>): void
	{
		// Create the window renderer now that we have skins
		if (!this._windowRenderer)
		{
			this._windowRenderer = new WindowRenderer(this._skinContainer);
		}

		let loaded = 0;

		for (const [skinId, skinData] of skins)
		{
			const renderer = BitmapSkinParser.parse(skinData, atlases);

			// Find all element descriptors that reference this skin asset
			const descriptors = this._elementRegistry.getDescriptorsByAsset(skinId);

			if (descriptors.length === 0)
			{
				continue;
			}

			for (const descriptor of descriptors)
			{
				const defaults = this._skinContainer.getDefaultAttributesByTypeAndStyle(descriptor.typeId, descriptor.style);

				if (defaults)
				{
					this._skinContainer.addSkinRenderer(
						descriptor.typeId,
						descriptor.style,
						descriptor.intent,
						renderer,
						null,
						defaults
					);

					loaded++;

					// log.debug(`Skin "${ skinId }" → type=${ descriptor.typeId } style=${ descriptor.style } (stateDrawable[0]=${ renderer.isStateDrawable(0) })`);
				}
			}
		}

		log.info(`Skin assets loaded: ${loaded} renderers registered from ${skins.size} skins`);
	}

	/**
	 * Dispose the window manager.
	 */
	dispose(): void
	{
		if (this._disposed) return;

		this._disposed = true;

		// Dispose window contexts
		for (const context of this._windowContextArray)
		{
			context.dispose();
		}

		this._windowContextArray.length = 0;
		this._defaultContext = null;

		// Clean up service manager
		if (this._serviceManager)
		{
			this._serviceManager.dispose();
			this._serviceManager = null;
		}

		// Clean up resource manager
		if (this._resourceManager)
		{
			this._resourceManager.dispose();
			this._resourceManager = null;
		}

		// Clean up skin container and theme manager
		this._skinContainer.dispose();
		this._themeManager = null;

		// Clean up widget layouts
		this._widgetLayouts.clear();

		// Clean up component dependencies
		this._avatarRenderer = null;
		this._communication = null;

		// Clean up declarative window system
		this._windows.clear();
		this._layouts.clear();
		this._windowEvents.removeAllListeners();
		this._elementRegistry.dispose();

		super.dispose();
	}

	/**
	 * Initialize the 4 window context layers.
	 *
	 * Creates a WindowContext per layer, each with its own DesktopController
	 * root and WindowParser for JSON layout building.
	 */
	private initContexts(): void
	{
		if (this._initialized) return;

		this._initialized = true;

		Classes.init();

		const factory = this as unknown as IWindowFactory;
		const serviceManager = new ServiceManager();
		const widgetFactory = new HabboWidgetFactory(this);
		const resourceManager = new ResourceManager(this);

		this._serviceManager = serviceManager;
		this._resourceManager = resourceManager;

		for (let i = 0; i < HabboWindowManager.NUMBER_OF_CONTEXT_LAYERS; i++)
		{
			const context = new WindowContext(`layer_${i}`, factory);

			// Inject shared service manager into each context
			context.setServices(serviceManager);

			// Inject widget factory for WidgetWindowController
			context.setWidgetFactory(widgetFactory);

			// Inject resource manager for StaticBitmapWrapperController
			context.setResourceManager(resourceManager);

			// Create desktop root for this layer
			const desktop = new DesktopController(
				`desktop_${i}`,
				WindowType.CONTAINER,
				0,
				0,
				context,
				{x: 0, y: 0, width: 0, height: 0}
			);

			context.setDesktop(desktop);

			// Create parser for JSON layout building
			const parser = new WindowParser();

			context.setParser(parser);

			this._windowContextArray.push(context);
		}

		this._defaultContext = this._windowContextArray[HabboWindowManager.DEFAULT_CONTEXT_LAYER_INDEX];

		log.info(`Window manager initialized with ${HabboWindowManager.NUMBER_OF_CONTEXT_LAYERS} context layers (${Classes.getRegisteredTypes().length} types registered)`);
	}

	/**
	 * Get the maximum z-order in a given layer.
	 */
	private getMaxZOrder(layer: number): number
	{
		let max = -1;

		for (const instance of this._windows.values())
		{
			if (instance.layer === layer && instance.zOrder > max)
			{
				max = instance.zOrder;
			}
		}

		return max;
	}
}
