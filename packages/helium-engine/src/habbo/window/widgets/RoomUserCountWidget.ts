import type {IRoomUserCountWidget} from './IRoomUserCountWidget';
import type {IWidgetProperty} from './IWidget';

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

	constructor()
	{
	}

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

	public get properties(): IWidgetProperty[]
	{
		return [];
	}

	public setProperties(_values: IWidgetProperty[]): void
	{
		// AS3: properties setter is a no-op for this widget
	}

	public dispose(): void
	{
		if (this._disposed) return;

		this._disposed = true;
	}
}

