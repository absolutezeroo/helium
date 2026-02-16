import type { IDisposable } from '@core/runtime/IDisposable';
import type { IWindow } from '@core/window/IWindow';
import type { IWindowContainer } from '@core/window/IWindowContainer';
import type { WindowEvent } from '@core/window/events/WindowEvent';
import type { IHabboTransitionalNavigator } from '../IHabboTransitionalNavigator';

/**
 * Room event info display in the toolbar extension area.
 *
 * Shows compact/expanded event info with modify/extend buttons.
 *
 * @see sources/win63_version/habbo/navigator/inroom/RoomEventInfoCtrl.as
 */
export class RoomEventInfoCtrl implements IDisposable
{
    private static readonly TOOLBAR_EXTENSION_ID: string = 'room_event_info';

    private _navigator: IHabboTransitionalNavigator | null;
    private _window: IWindowContainer | null = null;
    private _expanded: boolean = false;
    private _disposed: boolean = false;

    constructor(navigator: IHabboTransitionalNavigator)
    {
        this._navigator = navigator;
    }

    get disposed(): boolean
    {
        return this._disposed;
    }

    set expanded(value: boolean)
    {
        this._expanded = value;
    }

    get expanded(): boolean
    {
        return this._expanded;
    }

    refresh(): void
    {
        if(!this._navigator) return;

        const roomData = this._navigator.data.enteredGuestRoom;

        if(!roomData || !roomData.roomAdName || roomData.roomAdName.length === 0)
        {
            this.close();
            return;
        }
    }

    close(): void
    {
        if(this._window)
        {
            this._window.visible = false;
        }
    }

    private canExtend(): boolean
    {
        return false;
    }

    private onGetEventClick = (_event: WindowEvent): void =>
    {
        if(!this._navigator) return;

        if(this._navigator.roomEventViewCtrl)
        {
            this._navigator.roomEventViewCtrl.show();
        }
    };

    private onModify = (_event: WindowEvent): void =>
    {
        if(!this._navigator?.roomEventViewCtrl) return;

        this._navigator.roomEventViewCtrl.show();
    };

    dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        if(this._window)
        {
            (this._window as IWindow).dispose();
            this._window = null;
        }

        this._navigator = null;
    }
}
