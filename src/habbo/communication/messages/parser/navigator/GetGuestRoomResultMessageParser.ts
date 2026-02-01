import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {GuestRoomData, RoomModerationSettings, RoomChatSettings} from '../../incoming/navigator';

/**
 * Parser for get guest room result message
 *
 * Based on AS3 GetGuestRoomResultEventParser
 */
export class GetGuestRoomResultMessageParser implements IMessageParser {
    private _enterRoom: boolean = false;
    private _roomForward: boolean = false;
    private _staffPick: boolean = false;
    private _isGroupMember: boolean = false;
    private _data: GuestRoomData | null = null;
    private _roomModerationSettings: RoomModerationSettings | null = null;
    private _chatSettings: RoomChatSettings | null = null;

    get enterRoom(): boolean {
        return this._enterRoom;
    }

    get roomForward(): boolean {
        return this._roomForward;
    }

    get staffPick(): boolean {
        return this._staffPick;
    }

    get isGroupMember(): boolean {
        return this._isGroupMember;
    }

    get data(): GuestRoomData | null {
        return this._data;
    }

    get roomModerationSettings(): RoomModerationSettings | null {
        return this._roomModerationSettings;
    }

    get chatSettings(): RoomChatSettings | null {
        return this._chatSettings;
    }

    flush(): boolean {
        this._enterRoom = false;
        this._roomForward = false;
        this._staffPick = false;
        this._isGroupMember = false;
        this._data = null;
        this._roomModerationSettings = null;
        this._chatSettings = null;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean {
        this._enterRoom = wrapper.readBoolean();
        this._data = new GuestRoomData(wrapper);
        this._roomForward = wrapper.readBoolean();
        this._staffPick = wrapper.readBoolean();
        this._isGroupMember = wrapper.readBoolean();

        const allInRoomMuted = wrapper.readBoolean();
        this._roomModerationSettings = new RoomModerationSettings(wrapper);
        this._data.allInRoomMuted = allInRoomMuted;
        this._data.canMute = wrapper.readBoolean();

        this._chatSettings = new RoomChatSettings(wrapper);

        return true;
    }
}
