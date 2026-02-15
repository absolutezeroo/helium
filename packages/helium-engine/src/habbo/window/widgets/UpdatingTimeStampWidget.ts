import type {IWidget} from './IWidget';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IHabboWindowManager} from '../IHabboWindowManager';
import {PropertyStruct} from '@core/window/utils/PropertyStruct';

/**
 * Updating timestamp display widget.
 *
 * Displays a human-readable "time ago" string that updates every minute.
 * Uses FriendlyTime to format the elapsed duration (e.g. "5 minutes ago").
 *
 * In the AS3 version, uses a shared static Timer with 60-second interval
 * and ILabelWindow for display. In the TypeScript port, timestamp state
 * is stored for the UI layer.
 *
 * @see sources/win63_version/habbo/window/widgets/UpdatingTimeStampWidget.as
 */
export class UpdatingTimeStampWidget implements IWidget
{
	public static readonly TYPE: string = 'updating_timestamp';

	private static readonly UPDATE_INTERVAL_MS: number = 60000;

	constructor(window: IWidgetWindow, windowManager: IHabboWindowManager)
	{
		this._widgetWindow = window;
		this._windowManager = windowManager;
		this.reset();
	}

	private _widgetWindow: IWidgetWindow | null = null;
	private _windowManager: IHabboWindowManager | null = null;

	private _disposed: boolean = false;

	public get disposed(): boolean
	{
		return this._disposed;
	}

	private _timeStamp: number = 0;

	public get timeStamp(): number
	{
		return this._timeStamp;
	}

	public set timeStamp(value: number)
	{
		this._timeStamp = value;
	}

	private _align: string = '';

	/**
	 * The text alignment for the display label.
	 */
	public get align(): string
	{
		return this._align;
	}

	public set align(value: string)
	{
		this._align = value;
	}

	/**
	 * Get the elapsed seconds since the timestamp.
	 */
	public get elapsedSeconds(): number
	{
		return (Date.now() - Math.abs(this._timeStamp)) / 1000;
	}

	public get properties(): PropertyStruct[]
	{
		return [];
	}

	/**
	 * Reset the timestamp to the current time.
	 */
	public reset(): void
	{
		this._timeStamp = Date.now();
	}

	public set properties(_values: PropertyStruct[])
	{
		// AS3: properties setter is a no-op for this widget
	}

	public dispose(): void
	{
		if(this._disposed) return;

		this._widgetWindow = null;
		this._windowManager = null;
		this._disposed = true;
	}
}
