import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindow} from '@core/window/IWindow';
import type {IHabboTransitionalNavigator} from '../IHabboTransitionalNavigator';
import {TextFieldManager} from '../TextFieldManager';

/**
 * Room event (ad) creation/editing view controller.
 *
 * @see sources/win63_version/habbo/navigator/inroom/RoomEventViewCtrl.as
 */
export class RoomEventViewCtrl implements IDisposable
{
    private _navigator: IHabboTransitionalNavigator | null;
    private _window: IWindow | null = null;
    private _eventNameManager: TextFieldManager | null = null;
    private _eventDescManager: TextFieldManager | null = null;

    constructor(navigator: IHabboTransitionalNavigator)
    {
        this._navigator = navigator;
    }

    private _disposed: boolean = false;

    get disposed(): boolean
    {
        return this._disposed;
    }

    show(): void
    {
        if(!this._navigator) return;

        if(!this._window)
        {
            this._window = this._navigator.getJsonWindow('room_event_form');
        }

        if(this._window)
        {
            this._window.visible = true;
            this._window.activate();
        }
    }

    close(): void
    {
        if(this._window)
        {
            this._window.visible = false;
        }
    }

    dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;
        this._eventNameManager?.dispose();
        this._eventDescManager?.dispose();

        if(this._window)
        {
            this._window.dispose();
            this._window = null;
        }

        this._navigator = null;
    }

    private save(): void
    {
        if(!this.isMandatoryFieldsFilled()) return;

        // Send EditEventMessageComposer
    }

    private isMandatoryFieldsFilled(): boolean
    {
        let valid = true;

        if(this._eventNameManager)
        {
            if(!this._eventNameManager.checkMandatory(
                this._navigator?.getText('navigator.roomevent.nameerr') ?? 'Name required'
            ))
            {
                valid = false;
            }
        }

        if(this._eventDescManager)
        {
            if(!this._eventDescManager.checkMandatory(
                this._navigator?.getText('navigator.roomevent.descerr') ?? 'Description required'
            ))
            {
                valid = false;
            }
        }

        return valid;
    }

    private clearErrors(): void
    {
        this._eventNameManager?.clearErrors();
        this._eventDescManager?.clearErrors();
    }
}
