import type {IRoomUserCountWidget} from './IRoomUserCountWidget';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IHabboWindowManager} from '../IHabboWindowManager';
import {PropertyStruct} from '@core/window/utils/PropertyStruct';

/**
 * Room user count display widget.
 *
 * Displays the current number of users in a room. Currently a minimal
 * stub matching the AS3 implementation which has empty method bodies.
 *
 * @see sources/win63_version/habbo/window/widgets/RoomUserCountWidget.as
 */
export class RoomUserCountWidget implements IRoomUserCountWidget
{
	public static readonly TYPE: string = 'room_user_count';

	constructor(window: IWidgetWindow, windowManager: IHabboWindowManager)
	{
		this._widgetWindow = window;
		this._windowManager = windowManager;
	}

	private _widgetWindow: IWidgetWindow | null = null;
	private _windowManager: IHabboWindowManager | null = null;

	private _disposed: boolean = false;

	public get disposed(): boolean
	{
		return this._disposed;
	}

	private _userCount: number = 0;

	public get userCount(): number
	{
		return this._userCount;
	}

	public set userCount(value: number)
	{
		this._userCount = value;
	}

	public get properties(): PropertyStruct[]
	{
		return [];
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
