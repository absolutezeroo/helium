import type {EventEmitter} from 'eventemitter3';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindowInstance} from './IWindowInstance';
import type {IWindowLayout} from './IWindowLayout';
import type {IElementDescriptionData} from './IElementDescriptor';
import type {ElementRegistry} from './ElementRegistry';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContext} from '@core/window/IWindowContext';
import type {IInputEventTracker} from '@core/window/IInputEventTracker';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWindowRenderer} from '@core/window/graphics/IWindowRenderer';
import type {ISkinContainer} from '@core/window/graphics/ISkinContainer';
import type {ISkinData} from '@core/window/graphics/renderer/BitmapSkinParser';
import type {IModalDialog} from './utils/IModalDialog';
import type {IInternalWindowServices} from "@core/window";
import type {IAvatarRenderManager} from '@habbo/avatar/IAvatarRenderManager';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';

/**
 * Events emitted by the window manager.
 */
export const WindowManagerEvents =
{
    WINDOW_OPEN: 'window:open',
    WINDOW_CLOSE: 'window:close',
    WINDOW_UPDATE: 'window:update',
    WINDOW_ELEMENT_CLICK: 'window:element:click',
} as const;

/**
 * Interface for the Habbo Window Manager.
 *
 * Manages the lifecycle of declarative windows: opening from JSON layouts,
 * resolving variables, tracking instances, and emitting events for the UI layer.
 *
 * Also provides the AS3-compatible ICoreWindowManager + IHabboWindowManager API
 * for creating windows programmatically, showing alerts/confirms, managing hints,
 * and accessing window contexts.
 *
 * @see sources/win63_2021_version/com/sulake/habbo/window/IHabboWindowManager.as
 * @see sources/win63_2021_version/com/sulake/habbo/window/HabboWindowManagerComponent.as
 */
export interface IHabboWindowManager extends IDisposable
{
    // ── Declarative window API (existing) ──────────────────────────────

    /**
     * Event emitter for window lifecycle events.
     * Emits 'window:open', 'window:close', 'window:update'.
     *
     * NOTE: This is NOT the Component.events emitter.
     * Uses a separate emitter to avoid the DI override bug.
     */
    readonly windowEvents: EventEmitter;

    /**
     * The element registry containing descriptors for all element types.
     */
    readonly elementRegistry: ElementRegistry;

    /**
     * Load element description data into the registry.
     */
    loadElementDescription(data: IElementDescriptionData): void;

    /**
     * Open a window from a preloaded layout.
     */
    openWindow(layout: IWindowLayout, vars?: Record<string, unknown>, layer?: number): IWindowInstance;

    /**
     * Close and destroy a window by its instance ID.
     */
    closeWindow(id: number): void;

    /**
     * Get a window instance by ID.
     */
    getWindow(id: number): IWindowInstance | null;

    /**
     * Get all open windows, optionally filtered by layer.
     */
    getWindows(layer?: number): IWindowInstance[];

    /**
     * Register a layout by name for later retrieval.
     */
    registerLayout(name: string, layout: IWindowLayout): void;

    /**
     * Get a registered layout by name.
     */
    getLayout(name: string): IWindowLayout | null;

    // ── AS3-compatible API (ICoreWindowManager + IHabboWindowManager) ──

    /**
     * Create a window using the core factory.
     *
     * @param name - Window name
     * @param type - WindowType constant
     * @param style - WindowStyle constant
     * @param param - WindowParam flags
     * @param rect - Position and size
     * @param procedure - Event handler callback
     * @param dynamicStyle - Optional dynamic style name
     * @param id - Optional window ID
     * @param tags - Optional tags
     * @param parent - Optional parent window
     * @param properties - Optional property array
     * @returns The created IWindow
     */
    create(
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
    ): IWindow;

    /**
     * Destroy a window.
     */
    destroy(window: IWindow): void;

    /**
     * Build a window tree from a JSON layout definition.
     *
     * @param json - The JSON layout object
     * @param layer - Context layer (default 1)
     * @param vars - Variable map
     * @returns The root IWindow
     */
    buildFromJSON(json: unknown, layer?: number, vars?: Map<string, string> | null): IWindow;

    /**
     * Register a widget layout JSON asset by name.
     *
     * In AS3, widget layouts were stored as XML assets in the SWF asset library.
     * Here we register JSON layout objects by name so widgets can build their
     * internal window trees.
     *
     * @param name - The layout asset name (e.g. "hover_bitmap", "avatar_image")
     * @param json - The JSON layout object
     */
    registerWidgetLayout(name: string, json: unknown): void;

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
    buildWidgetLayout(name: string, layer?: number): IWindow | null;

    /**
     * Create a window by name, type, style, param in a given context layer.
     *
     * @param name - Window name
     * @param caption - Display caption
     * @param type - WindowType
     * @param style - WindowStyle
     * @param param - WindowParam
     * @param rect - Position and size
     * @param procedure - Event handler
     * @param id - Window ID
     * @param layer - Context layer (default 1)
     * @param dynamicStyle - Dynamic style name
     * @returns The created IWindow
     */
    createWindow(
        name: string,
        caption?: string,
        type?: number,
        style?: number,
        param?: number,
        rect?: { x: number; y: number; width: number; height: number } | null,
        procedure?: ((event: unknown, window: IWindow) => void) | null,
        id?: number,
        layer?: number,
        dynamicStyle?: string
    ): IWindow;

    /**
     * Remove a window by name from a context layer.
     */
    removeWindow(name: string, layer?: number): void;

    /**
     * Get a window by name from a context layer.
     */
    getWindowByName(name: string, layer?: number): IWindow | null;

    /**
     * Get the topmost active window in a context layer.
     */
    getActiveWindow(layer?: number): IWindow | null;

    /**
     * Toggle fullscreen mode.
     */
    toggleFullScreen(): void;

    /**
     * Get a window context by layer index.
     */
    getWindowContext(layer: number): IWindowContext;

    /**
     * Get the desktop window for a given context layer.
     */
    getDesktop(layer: number): IWindow | null;

    /**
     * Search for a window by name across all context layers.
     */
    findWindowByName(name: string): IWindow | null;

    /**
     * Search for a window by tag across all context layers.
     */
    findWindowByTag(tag: string): IWindow | null;

    /**
     * Add an input event tracker to all context layers.
     */
    addMouseEventTracker(tracker: IInputEventTracker): void;

    /**
     * Remove an input event tracker from all context layers.
     */
    removeMouseEventTracker(tracker: IInputEventTracker): void;

    /**
     * Register a localization parameter.
     */
    registerLocalizationParameter(key: string, parameter: string, value: string, delimiter?: string): void;

    /**
     * Create an unseen item counter widget.
     */
    createUnseenItemCounter(): IWindowContainer | null;

    /**
     * Register a hint window.
     */
    registerHintWindow(hintId: string, window: IWindow, direction?: number): void;

    /**
     * Unregister a hint window.
     */
    unregisterHintWindow(hintId: string): void;

    /**
     * Show a hint by ID.
     */
    showHint(hintId: string, rect?: { x: number; y: number; width: number; height: number } | null): void;

    /**
     * Hide the current hint.
     */
    hideHint(): void;

    /**
     * Hide a hint matching the given ID.
     */
    hideMatchingHint(hintId: string): void;

    /**
     * Open a help page.
     */
    openHelpPage(pageId: string): void;

    /**
     * Build a modal dialog from a JSON layout definition.
     *
     * Creates a dimmed background overlay and a centered content
     * window from the provided layout. Returns an IModalDialog
     * that wraps both.
     *
     * In AS3: buildModalDialogFromXML(xml: XML): IModalDialog
     *
     * @param json - The JSON layout object
     * @returns The modal dialog instance
     */
    buildModalDialogFromJSON(json: unknown): IModalDialog;

    /**
     * Registers a bitmap asset with the resource manager.
     *
     * Called by the client layer after loading images. Assets registered
     * here are available to StaticBitmapWrapperController via `assetUri`.
     *
     * @param name - The asset name
     * @param bitmap - The decoded ImageBitmap
     */
    registerAsset(name: string, bitmap: ImageBitmap): void;

    /**
     * Registers an asset URL for lazy loading.
     *
     * The bitmap is NOT decoded immediately. When a window requests this
     * asset via `assetUri`, it is fetched and decoded on demand.
     *
     * @param name - The asset name
     * @param url - The URL to fetch the image from
     */
    registerAssetUrl(name: string, url: string): void;

    /**
     * Loads skin assets and creates BitmapSkinRenderers from skin JSON data.
     *
     * @param skins - Map of skin id → skin JSON data
     * @param atlases - Map of atlas asset name → ImageBitmap
     */
    loadSkinAssets(skins: Map<string, ISkinData>, atlases: Map<string, ImageBitmap>): void;

    /**
     * Returns the skin container.
     */
    getSkinContainer(): ISkinContainer;

    /**
     * Returns the window renderer.
     */
    getWindowRenderer(): IWindowRenderer | null;

    /**
     * Composites all window layers into a single OffscreenCanvas buffer.
     *
     * Walks each context layer, retrieves its desktop, and recursively
     * draws each window's skin buffer at its absolute position.
     *
     * @param width - The target buffer width
     * @param height - The target buffer height
     * @returns The composited buffer, or null if renderer is unavailable
     */
    compositeToBuffer(width: number, height: number): OffscreenCanvas | null;

    /**
     * Finds the deepest visible window at the given screen point.
     *
     * Iterates layers in reverse order (tooltips → background) so that
     * the topmost layer wins.
     *
     * @param x - The global X coordinate
     * @param y - The global Y coordinate
     * @returns The deepest window at the point, or null
     */
    findWindowAtPoint(x: number, y: number): IWindow | null;

    /**
     * Display the floor plan editor.
     */
    displayFloorPlanEditor(): void;

    /**
     * Returns the shared service manager for mouse drag/scale operations.
     *
     * Used by the client renderer to forward DOM mouse events.
     */
    getServiceManager(): IInternalWindowServices | null;

    /**
     * The avatar render manager.
     *
     * Injected via component dependency. Used by AvatarImageWidget
     * and other widgets that render avatars.
     *
     * In AS3: HabboWindowManagerComponent.avatarRenderer
     */
    readonly avatarRenderer: IAvatarRenderManager | null;

    /**
     * The communication manager.
     *
     * Injected via component dependency. Used by widgets that need
     * to send messages (e.g. GetExtendedProfileMessageComposer).
     *
     * In AS3: HabboWindowManagerComponent.communication
     */
    readonly communication: IHabboCommunicationManager | null;
}
