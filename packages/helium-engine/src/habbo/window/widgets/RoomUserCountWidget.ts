import type { IRoomUserCountWidget } from './IRoomUserCountWidget';
import type { IWidgetProperty } from './IWidget';

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

    private _disposed: boolean = false;
    private _userCount: number = 0;

    constructor()
    {
    }

    public set userCount(value: number)
    {
        this._userCount = value;
    }

    public get userCount(): number
    {
        return this._userCount;
    }

    public get properties(): IWidgetProperty[]
    {
        return [];
    }

    public setProperties(_values: IWidgetProperty[]): void
    {
        // AS3: properties setter is a no-op for this widget
    }

    public get disposed(): boolean
    {
        return this._disposed;
    }

    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;
    }
}

