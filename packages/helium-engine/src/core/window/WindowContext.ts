import type {IWindow} from './IWindow';
import type {IWindowContext} from './IWindowContext';
import type {IWindowFactory} from './IWindowFactory';
import type {IWidgetFactory} from './IWidgetFactory';
import type {IWindowParser} from './utils/IWindowParser';
import type {IWindowRenderer} from './graphics/IWindowRenderer';
import type {IInternalWindowServices} from './services/IInternalWindowServices';
import type {IInputEventTracker} from './IInputEventTracker';
import type {IResourceManager} from './IResourceManager';
import {Classes} from './Classes';

/**
 * Window context implementation.
 *
 * Represents a single rendering layer. Each context has its own desktop,
 * factory, parser, and service manager. The HabboWindowManagerComponent
 * creates 4 contexts (one per WindowContextLayer).
 *
 * @see sources/win63_2021_version/com/sulake/core/window/WindowContext.as
 */
export class WindowContext implements IWindowContext
{
	public static readonly INPUT_MODE_MOUSE: number = 0;
	public static readonly INPUT_MODE_TOUCH: number = 1;
	public static readonly ERROR_UNKNOWN: number = 0;
	public static readonly ERROR_INVALID_WINDOW: number = 1;
	public static readonly ERROR_WINDOW_NOT_FOUND: number = 2;
	public static readonly ERROR_WINDOW_ALREADY_EXISTS: number = 3;
	public static readonly ERROR_UNKNOWN_WINDOW_TYPE: number = 4;
	public static readonly ERROR_DURING_EVENT_HANDLING: number = 5;

	/**
	 * Shared renderer reference (AS3: static var_1836).
	 * Set by HabboWindowManager when the renderer is created.
	 */
	private static _renderer: IWindowRenderer | null = null;

	/**
	 * Sets the shared window renderer for all contexts.
	 *
	 * @param renderer - The window renderer
	 */
	public static setRenderer(renderer: IWindowRenderer | null): void
	{
		WindowContext._renderer = renderer;
	}

	public inputEventTrackers: IInputEventTracker[] = [];

	protected _services: IInternalWindowServices | null = null;
	protected _parser: IWindowParser | null = null;
	protected _factory: IWindowFactory;
	protected _widgetFactory: IWidgetFactory | null = null;
	protected _desktop: IWindow | null = null;
	protected _resourceManager: IResourceManager | null = null;
	protected _throwErrors: boolean = true;
	protected _lastError: Error | null = null;
	protected _lastErrorCode: number = -1;

	constructor(
		name: string,
		factory: IWindowFactory,
		rect?: { x: number; y: number; width: number; height: number } | null
	)
	{
		this._name = name;
		this._factory = factory;

		// Desktop and parser are lazily initialized or set externally
	}

	private _disposed: boolean = false;

	public get disposed(): boolean
	{
		return this._disposed;
	}

	private _name: string;

	public get name(): string
	{
		return this._name;
	}

	public setDesktop(desktop: IWindow): void
	{
		this._desktop = desktop;
	}

	public setServices(services: IInternalWindowServices): void
	{
		this._services = services;
	}

	public setParser(parser: IWindowParser): void
	{
		this._parser = parser;
	}

	public setWidgetFactory(widgetFactory: IWidgetFactory): void
	{
		this._widgetFactory = widgetFactory;
	}

	public setResourceManager(resourceManager: IResourceManager): void
	{
		this._resourceManager = resourceManager;
	}

	public getResourceManager(): IResourceManager | null
	{
		return this._resourceManager;
	}

	public getWindowServices(): IInternalWindowServices
	{
		return this._services!;
	}

	public getWindowParser(): IWindowParser
	{
		return this._parser!;
	}

	public getWindowFactory(): IWindowFactory
	{
		return this._factory;
	}

	public getDesktopWindow(): IWindow | null
	{
		return this._desktop;
	}

	public getWidgetFactory(): IWidgetFactory | null
	{
		return this._widgetFactory;
	}

	public findWindowByName(name: string): IWindow | null
	{
		if (!this._desktop) return null;

		return (this._desktop as any).findChildByName?.(name) ?? null;
	}

	public findWindowByTag(tag: string): IWindow | null
	{
		if (!this._desktop) return null;

		return (this._desktop as any).findChildByTag?.(tag) ?? null;
	}

	public groupChildrenWithTag(tag: string, result: IWindow[], depth: number = 0): number
	{
		if (!this._desktop) return 0;

		return (this._desktop as any).groupChildrenWithTag?.(tag, result, depth) ?? 0;
	}

	public registerLocalizationListener(_key: string, _window: IWindow): void
	{
		// Localization integration - to be connected later
	}

	public removeLocalizationListener(_key: string, _window: IWindow): void
	{
		// Localization integration - to be connected later
	}

	public create(
		_layerName: string,
		name: string,
		type: number,
		style: number,
		param: number,
		rect: { x: number; y: number; width: number; height: number },
		procedure: ((event: unknown, window: IWindow) => void) | null,
		parent: IWindow | null,
		id: number,
		tags: string[] | null = null,
		dynamicStyle: string = '',
		_properties: unknown[] | null = null
	): IWindow
	{
		const windowClass = Classes.getWindowClassByType(type);

		if (!windowClass)
		{
			this.handleError(
				WindowContext.ERROR_UNKNOWN_WINDOW_TYPE,
				new Error(`Failed to solve implementation for window "${name}"!`)
			);

			return null!;
		}

		if (!parent)
		{
			if (param & 0x10) // USE_PARENT_GRAPHIC_CONTEXT
			{
				parent = this._desktop;
			}
		}

		const window = new windowClass(
			name, type, style, param, this, rect,
			parent ?? this._desktop,
			procedure, tags, null, id, dynamicStyle
		) as unknown as IWindow;

		return window;
	}

	public destroy(window: IWindow): boolean
	{
		if (window === this._desktop)
		{
			this._desktop = null;
		}

		if (window.state !== 0x40000000)
		{
			window.destroy();
		}

		return true;
	}

	public invalidate(window: IWindow, rect: {
		x: number;
		y: number;
		width: number;
		height: number
	} | null, flags: number): void
	{
		if(this._disposed) return;

		if(WindowContext._renderer)
		{
			WindowContext._renderer.addToRenderQueue(window, rect, flags);
		}
	}

	public getLastError(): Error | null
	{
		return this._lastError;
	}

	public getLastErrorCode(): number
	{
		return this._lastErrorCode;
	}

	public handleError(code: number, error: Error): void
	{
		this._lastError = error;
		this._lastErrorCode = code;

		if (this._throwErrors)
		{
			throw error;
		}
	}

	public flushError(): void
	{
		this._lastError = null;
		this._lastErrorCode = -1;
	}

	public addMouseEventTracker(tracker: IInputEventTracker): void
	{
		if (this.inputEventTrackers.indexOf(tracker) < 0)
		{
			this.inputEventTrackers.push(tracker);
		}
	}

	public removeMouseEventTracker(tracker: IInputEventTracker): void
	{
		const index = this.inputEventTrackers.indexOf(tracker);

		if (index > -1)
		{
			this.inputEventTrackers.splice(index, 1);
		}
	}

	public dispose(): void
	{
		if (!this._disposed)
		{
			this._disposed = true;

			if (this._desktop)
			{
				this._desktop.destroy();
				this._desktop = null;
			}

			if (this._parser)
			{
				this._parser.dispose();
				this._parser = null;
			}

			this._services = null;
			this._factory = null!;
			this._widgetFactory = null;
		}
	}
}

