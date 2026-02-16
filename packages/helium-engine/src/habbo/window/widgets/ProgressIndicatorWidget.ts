import type {IWidget} from './IWidget';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IHabboWindowManager} from '../IHabboWindowManager';
import type {IWindow} from '@core/window/IWindow';
import {PropertyStruct} from '@core/window/utils/PropertyStruct';

/**
 * Progress bar widget.
 *
 * Displays a row of progress indicator disks that can operate in
 * "position" mode (single active disk) or "progress" mode (filled bar).
 * Supports configurable size, style, and position.
 *
 * In the AS3 version, uses IItemListWindow with IStaticBitmapWrapperWindow
 * items. In the TypeScript port, progress state is stored for the UI layer.
 *
 * @see sources/win63_version/habbo/window/widgets/ProgressIndicatorWidget.as
 */
export class ProgressIndicatorWidget implements IWidget
{
	public static readonly TYPE: string = 'progress_indicator';

	private static readonly STYLE_KEY: string = 'progress_indicator:style';
	private static readonly SIZE_KEY: string = 'progress_indicator:size';
	private static readonly POSITION_KEY: string = 'progress_indicator:position';
	private static readonly MODE_KEY: string = 'progress_indicator:mode';

	private static readonly MAXIMUM_SIZE: number = 1000;

	private _widgetWindow: IWidgetWindow | null = null;
	private _windowManager: IHabboWindowManager | null = null;
	private _root: IWindow | null = null;

	constructor(window: IWidgetWindow, windowManager: IHabboWindowManager)
	{
		this._widgetWindow = window;
		this._windowManager = windowManager;

		const root = this._windowManager.buildWidgetLayout('progress_indicator');

		if (root)
		{
			this._root = root;
		}

		this._widgetWindow.setParamFlag(147456);
		this._widgetWindow.rootWindow = this._root;
	}

	private _disposed: boolean = false;

	public get disposed(): boolean
	{
		return this._disposed;
	}

	private _style: string = 'flat';

	public get style(): string
	{
		return this._style;
	}

	public set style(value: string)
	{
		this._style = value;
	}

	private _size: number = 1;

	public get size(): number
	{
		return this._size;
	}

	public set size(value: number)
	{
		this._size = Math.min(Math.max(value, 1), ProgressIndicatorWidget.MAXIMUM_SIZE);
	}

	private _position: number = 0;

	public get position(): number
	{
		return this._position;
	}

	public set position(value: number)
	{
		this._position = value;
	}

	private _mode: string = 'position';

	public get mode(): string
	{
		return this._mode;
	}

	public set mode(value: string)
	{
		this._mode = value;
	}

	public get properties(): PropertyStruct[]
	{
		if (this._disposed) return [];

		return [
			new PropertyStruct(ProgressIndicatorWidget.STYLE_KEY, this._style),
			new PropertyStruct(ProgressIndicatorWidget.SIZE_KEY, this._size),
			new PropertyStruct(ProgressIndicatorWidget.POSITION_KEY, this._position),
			new PropertyStruct(ProgressIndicatorWidget.MODE_KEY, this._mode),
		];
	}

	public set properties(values: PropertyStruct[])
	{
		for (const prop of values)
		{
			switch (prop.key)
			{
				case ProgressIndicatorWidget.STYLE_KEY:
					this.style = String(prop.value);
					break;
				case ProgressIndicatorWidget.SIZE_KEY:
					this.size = Number(prop.value);
					break;
				case ProgressIndicatorWidget.POSITION_KEY:
					this.position = Number(prop.value);
					break;
				case ProgressIndicatorWidget.MODE_KEY:
					this.mode = String(prop.value);
					break;
			}
		}
	}

	/**
	 * Get the active state of each disk for rendering.
	 *
	 * @returns Array of booleans, one per disk
	 */
	public getDiskStates(): boolean[]
	{
		const states: boolean[] = [];

		for (let i = 0; i < this._size; i++)
		{
			switch (this._mode)
			{
				case 'position':
					states.push(i + 1 === this._position);
					break;
				case 'progress':
					states.push(i < this._position);
					break;
				default:
					states.push(false);
			}
		}

		return states;
	}

	/**
	 * Get the asset name for a disk at the given index.
	 */
	public getDiskAssetName(index: number): string
	{
		const active = this.getDiskStates()[index] ?? false;

		return 'progress_disk_' + this._style + (active ? '_on' : '_off');
	}

	public dispose(): void
	{
		if (this._disposed) return;

		if (this._root)
		{
			this._root.dispose();
			this._root = null;
		}

		if (this._widgetWindow)
		{
			this._widgetWindow.rootWindow = null;
			this._widgetWindow = null;
		}

		this._windowManager = null;
		this._disposed = true;
	}
}
