import type {IMessageDataWrapper} from '@core/communication';

/**
 * Moderation rights levels
 */
export const RoomModerationRights = {
    NONE: 0,
    RIGHTS: 1,
    RIGHTS_WITH_CONTROLLER: 2,
    GROUP_ADMINS: 4,
    OWNER_ONLY: 5,
} as const;

/**
 * Room moderation settings
 *
 * Based on AS3 com.sulake.habbo.communication.messages.incoming.roomsettings.class_1731
 */
export class RoomModerationSettings {
    private _whoCanMute: number = 0;
    private _whoCanKick: number = 0;
    private _whoCanBan: number = 0;

    constructor(wrapper: IMessageDataWrapper) {
        this._whoCanMute = wrapper.readInt();
        this._whoCanKick = wrapper.readInt();
        this._whoCanBan = wrapper.readInt();
    }

    get whoCanMute(): number {
        return this._whoCanMute;
    }

    get whoCanKick(): number {
        return this._whoCanKick;
    }

    get whoCanBan(): number {
        return this._whoCanBan;
    }
}
