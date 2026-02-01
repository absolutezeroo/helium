import type {IMessageDataWrapper} from '@core/communication';
import {GuestRoomData} from './GuestRoomData';

/**
 * Official room entry type constants
 */
export const OfficialRoomEntryType = {
    TAG: 1,
    GUEST_ROOM: 2,
    FOLDER: 4,
} as const;

/**
 * Official room entry data
 *
 * Based on AS3 com.sulake.habbo.communication.messages.incoming.navigator.class_1653
 */
export class OfficialRoomEntryData {
    private _index: number = 0;
    private _popupCaption: string = '';
    private _popupDesc: string = '';
    private _showDetails: boolean = false;
    private _picText: string = '';
    private _picRef: string = '';
    private _folderId: number = 0;
    private _userCount: number = 0;
    private _type: number = 0;
    private _tag: string = '';
    private _guestRoomData: GuestRoomData | null = null;
    private _open: boolean = false;
    private _disposed: boolean = false;

    constructor(wrapper: IMessageDataWrapper) {
        this._index = wrapper.readInt();
        this._popupCaption = wrapper.readString();
        this._popupDesc = wrapper.readString();
        this._showDetails = wrapper.readInt() === 1;
        this._picText = wrapper.readString();
        this._picRef = wrapper.readString();
        this._folderId = wrapper.readInt();
        this._userCount = wrapper.readInt();
        this._type = wrapper.readInt();

        if (this._type === OfficialRoomEntryType.TAG) {
            this._tag = wrapper.readString();
        } else if (this._type === OfficialRoomEntryType.GUEST_ROOM) {
            this._guestRoomData = new GuestRoomData(wrapper);
        } else {
            this._open = wrapper.readBoolean();
        }
    }

    get index(): number {
        return this._index;
    }

    get popupCaption(): string {
        return this._popupCaption;
    }

    get popupDesc(): string {
        return this._popupDesc;
    }

    get showDetails(): boolean {
        return this._showDetails;
    }

    get picText(): string {
        return this._picText;
    }

    get picRef(): string {
        return this._picRef;
    }

    get folderId(): number {
        return this._folderId;
    }

    get userCount(): number {
        return this._userCount;
    }

    get type(): number {
        return this._type;
    }

    get tag(): string {
        return this._tag;
    }

    get guestRoomData(): GuestRoomData | null {
        return this._guestRoomData;
    }

    get open(): boolean {
        return this._open;
    }

    get maxUsers(): number {
        if (this._type === OfficialRoomEntryType.TAG) {
            return 0;
        }
        if (this._type === OfficialRoomEntryType.GUEST_ROOM && this._guestRoomData) {
            return this._guestRoomData.maxUserCount;
        }
        return 0;
    }

    get disposed(): boolean {
        return this._disposed;
    }

    toggleOpen(): void {
        this._open = !this._open;
    }

    dispose(): void {
        if (this._disposed) {
            return;
        }
        this._disposed = true;
        if (this._guestRoomData) {
            this._guestRoomData.dispose();
            this._guestRoomData = null;
        }
    }
}
