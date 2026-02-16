import type { IDisposable } from '@core/runtime/IDisposable';
import type { IWindow } from '@core/window/IWindow';
import type { IWindowContainer } from '@core/window/IWindowContainer';
import type { ITextFieldWindow } from '@core/window/components/ITextFieldWindow';
import type { WindowEvent } from '@core/window/events/WindowEvent';
import type { IHabboTransitionalNavigator } from '../IHabboTransitionalNavigator';
import { TextFieldManager } from '../TextFieldManager';

/**
 * Room settings controller — the largest controller (~800 lines in AS3).
 *
 * Manages 5 tabs:
 * 1. Basic: name, description, tags, category, trade mode, max visitors
 * 2. Access Rights: door mode, password fields
 * 3. Room Rights: users with rights, friends list, add/remove
 * 4. Club & Chat: chat mode, bubble width, scroll speed, flood filter
 * 5. Moderation: mute/ban/kick settings
 *
 * @see sources/win63_version/habbo/navigator/roomsettings/RoomSettingsCtrl.as
 */
export class RoomSettingsCtrl implements IDisposable
{
    static readonly TAB_BASIC: number = 1;
    static readonly TAB_ACCESS_RIGHTS: number = 2;
    static readonly TAB_ROOM_RIGHTS: number = 3;
    static readonly TAB_CLUB_AND_CHAT: number = 4;
    static readonly TAB_MODERATION: number = 5;

    private static readonly HC_MAXIMUM_ROOM_VISITORS: number = 75;
    private static readonly MAXIMUM_ROOM_VISITORS: number = 50;

    private _flatId: number = 0;
    private _groupId: number = 0;
    private _navigator: IHabboTransitionalNavigator | null;
    private _originalData: unknown = null;
    private _window: IWindow | null = null;
    private _currentTab: number = RoomSettingsCtrl.TAB_BASIC;
    private _populating: boolean = false;
    private _roomNameManager: TextFieldManager | null = null;
    private _roomDescManager: TextFieldManager | null = null;
    private _disposed: boolean = false;

    constructor(navigator: IHabboTransitionalNavigator)
    {
        this._navigator = navigator;
    }

    get disposed(): boolean
    {
        return this._disposed;
    }

    /**
     * Opens room settings editor.
     *
     * @param flatId - The room ID
     */
    startRoomSettingsEdit(flatId: number): void
    {
        this._flatId = flatId;

        // Would send GetRoomSettingsMessageComposer
    }

    /**
     * Opens room settings from navigator with specific tab.
     *
     * @param flatId - The room ID
     * @param tab - Tab to open (or group ID)
     */
    startRoomSettingsEditFromNavigator(flatId: number, tab: number): void
    {
        this._flatId = flatId;
        this._groupId = tab;
        this.startRoomSettingsEdit(flatId);
    }

    /**
     * Receives room settings data from server.
     *
     * @param data - Room settings data
     */
    onRoomSettings(data: unknown): void
    {
        this._originalData = data;
        this._populating = true;
        this.populateForm();
        this._populating = false;
    }

    /**
     * Receives flat controllers list from server.
     *
     * @param flatId - Room ID
     * @param controllers - List of users with rights
     */
    onFlatControllers(flatId: number, controllers: unknown[]): void
    {
        if(flatId !== this._flatId) return;

        this.refreshFlatControllers();
    }

    onFlatControllerAdded(): void
    {
        this.refreshFlatControllers();
    }

    onFlatControllerRemoved(): void
    {
        this.refreshFlatControllers();
    }

    onBannedUsersFromRoom(): void
    {
        this.refreshBannedUsers();
    }

    onUserUnbannedFromRoom(): void
    {
        this.refreshBannedUsers();
    }

    onFriendListUpdate(): void
    {
        // Refresh friends list
    }

    onRoomSettingsSaveError(): void
    {
        // Handle save errors
    }

    save(): void
    {
        // Would send SaveRoomSettingsMessageComposer
    }

    close(): void
    {
        if(this._window)
        {
            this._window.visible = false;
        }
    }

    refresh(): void
    {
        // Refresh current tab display
    }

    private populateForm(): void
    {
        // Populate all form fields from _originalData
    }

    private refreshFlatControllers(): void
    {
        // Refresh users-with-rights list
    }

    private refreshBannedUsers(): void
    {
        // Refresh banned users list
    }

    dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;
        this._roomNameManager?.dispose();
        this._roomDescManager?.dispose();

        if(this._window)
        {
            this._window.dispose();
            this._window = null;
        }

        this._navigator = null;
    }
}
