import type {IMessageDataWrapper} from '@core/communication';
import {GuestRoomData} from '../navigator/GuestRoomData';

/**
 * Action allowed constants
 */
export const NavigatorSearchAction = {
    NONE: 0,
    GO_BACK: 1,
    CAN_EXPAND: 2,
} as const;

/**
 * A block of search results in the navigator
 *
 * Based on AS3 class_1770
 */
export class NavigatorSearchResultBlock {
    private _searchCode: string = '';
    private _text: string = '';
    private _actionAllowed: number = 0;
    private _forceClosed: boolean = false;
    private _viewMode: number = 0;
    private _guestRooms: GuestRoomData[] = [];

    constructor(wrapper: IMessageDataWrapper) {
        this._searchCode = wrapper.readString();
        this._text = wrapper.readString();
        this._actionAllowed = wrapper.readInt();
        this._forceClosed = wrapper.readBoolean();
        this._viewMode = wrapper.readInt();

        const count = wrapper.readInt();
        for (let i = 0; i < count; i++) {
            this._guestRooms.push(new GuestRoomData(wrapper));
        }
    }

    get searchCode(): string {
        return this._searchCode;
    }

    get text(): string {
        return this._text;
    }

    get actionAllowed(): number {
        return this._actionAllowed;
    }

    get forceClosed(): boolean {
        return this._forceClosed;
    }

    get viewMode(): number {
        return this._viewMode;
    }

    set viewMode(value: number) {
        this._viewMode = value;
    }

    get guestRooms(): GuestRoomData[] {
        return this._guestRooms;
    }

    findGuestRoom(flatId: number): GuestRoomData | null {
        for (const room of this._guestRooms) {
            if (room.flatId === flatId) {
                return room;
            }
        }
        return null;
    }
}
