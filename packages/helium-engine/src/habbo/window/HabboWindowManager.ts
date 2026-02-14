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

const log = Logger.getLogger('HabboWindowManager');

/**
 * Manages the lifecycle of declarative windows.
 *
 * Engine-side component that handles window creation, variable resolution,
 * and instance tracking. Emits events for the UI layer to react to.
 *
 * Uses a separate `_windowEvents` emitter (NOT `events`) to avoid
 * the Component DI override bug.
 *
 * @see sources/win63_version/habbo/window/HabboWindowManagerComponent.as
 */
export class HabboWindowManager extends Component implements IHabboWindowManager
{
	private _windows: Map<number, IWindowInstance> = new Map();
	private _nextId: number = 1;

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

	/**
	 * Load element description data into the registry.
	 *
	 * @param data - Parsed element-description.json content
	 */
	loadElementDescription(data: IElementDescriptionData): void
	{
		this._elementRegistry.load(data);
		log.info(`Element registry loaded: ${data.elements.length} descriptors`);
	}

	/**
	 * Open a window from a layout.
	 *
	 * @param layout - The layout data
	 * @param vars - Variable overrides
	 * @param layer - Context layer (default: DEFAULT = 1)
	 * @returns The created window instance
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
	 * Dispose the window manager.
	 */
	dispose(): void
	{
		if (this._disposed) return;

		this._disposed = true;

		this._windows.clear();
		this._windowEvents.removeAllListeners();
		this._elementRegistry.dispose();

		super.dispose();
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
