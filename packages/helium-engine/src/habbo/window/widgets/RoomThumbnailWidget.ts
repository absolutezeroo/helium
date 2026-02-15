import type {IRoomThumbnailWidget} from './IRoomThumbnailWidget';
import type {IWidgetProperty} from './IWidget';

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

	constructor()
	{
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

	public get properties(): IWidgetProperty[]
	{
		return [];
	}

	public reset(): void
	{
		this._flatId = 0;
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

