import type {EventEmitter} from 'eventemitter3';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindowInstance} from './IWindowInstance';
import type {IWindowLayout} from './IWindowLayout';
import type {IElementDescriptionData} from './IElementDescriptor';
import type {ElementRegistry} from './ElementRegistry';

/**
 * Events emitted by the window manager.
 */
export const WindowManagerEvents =
	{
		WINDOW_OPEN: 'window:open',
		WINDOW_CLOSE: 'window:close',
		WINDOW_UPDATE: 'window:update',
	} as const;

/**
 * Interface for the Habbo Window Manager.
 *
 * Manages the lifecycle of declarative windows: opening from JSON layouts,
 * resolving variables, tracking instances, and emitting events for the UI layer.
 *
 * @see sources/win63_version/habbo/window/HabboWindowManagerComponent.as
 */
export interface IHabboWindowManager extends IDisposable
{
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
	 *
	 * @param data - Parsed element-description.json content
	 */
	loadElementDescription(data: IElementDescriptionData): void;

	/**
	 * Open a window from a preloaded layout.
	 *
	 * @param layout - The layout data (already loaded from JSON)
	 * @param vars - Variable overrides for $var substitution
	 * @param layer - Context layer (0-3, default 1)
	 * @returns The created window instance
	 */
	openWindow(layout: IWindowLayout, vars?: Record<string, unknown>, layer?: number): IWindowInstance;

	/**
	 * Close and destroy a window by its instance ID.
	 *
	 * @param id - The window instance ID
	 */
	closeWindow(id: number): void;

	/**
	 * Get a window instance by ID.
	 *
	 * @param id - The window instance ID
	 * @returns The window instance, or null if not found
	 */
	getWindow(id: number): IWindowInstance | null;

	/**
	 * Get all open windows, optionally filtered by layer.
	 *
	 * @param layer - If provided, only return windows in this layer
	 * @returns Array of window instances
	 */
	getWindows(layer?: number): IWindowInstance[];
}
