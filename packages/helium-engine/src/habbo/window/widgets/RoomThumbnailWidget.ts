import type {IRoomThumbnailWidget} from './IRoomThumbnailWidget';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IHabboWindowManager} from '../IHabboWindowManager';
import {PropertyStruct} from '@core/window/utils/PropertyStruct';

/**
 * Room thumbnail widget.
 *
 * Displays a thumbnail image for a room. Currently a minimal stub
 * matching the AS3 implementation which has empty method bodies.
 *
 * @see sources/win63_version/habbo/window/widgets/RoomThumbnailWidget.as
 */
export class RoomThumbnailWidget implements IRoomThumbnailWidget
{
	public static readonly TYPE: string = 'room_thumbnail';

	private _widgetWindow: IWidgetWindow | null = null;
	private _windowManager: IHabboWindowManager | null = null;

	constructor(window: IWidgetWindow, windowManager: IHabboWindowManager)
	{
		this._widgetWindow = window;
		this._windowManager = windowManager;
	}

	private _disposed: boolean = false;

	public get disposed(): boolean
	{
		return this._disposed;
	}

	private _flatId: number = 0;

	public get flatId(): number
	{
		return this._flatId;
	}

	public set flatId(value: number)
	{
		this._flatId = value;
	}

	public get properties(): PropertyStruct[]
	{
		return [];
	}

	public reset(): void
	{
		this._flatId = 0;
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
