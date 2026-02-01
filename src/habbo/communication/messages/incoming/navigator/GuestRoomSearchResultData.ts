import type {IMessageDataWrapper} from '@core/communication';
import type {INavigatorSearchResultData} from './INavigatorSearchResultData';
import {GuestRoomData} from './GuestRoomData';
import {OfficialRoomEntryData} from './OfficialRoomEntryData';

/**
 * Guest room search result data
 *
 * Based on AS3 com.sulake.habbo.communication.messages.incoming.navigator.class_1742
 */
export class GuestRoomSearchResultData implements INavigatorSearchResultData {
    private _searchType: number = 0;
    private _searchParam: string = '';
    private _rooms: GuestRoomData[] = [];
    private _ad: OfficialRoomEntryData | null = null;
    private _disposed: boolean = false;

    constructor(wrapper: IMessageDataWrapper) {
        this._searchType = wrapper.readInt();
        this._searchParam = wrapper.readString();

        const count = wrapper.readInt();
        for (let i = 0; i < count; i++) {
            this._rooms.push(new GuestRoomData(wrapper));
        }

        const hasAd = wrapper.readBoolean();
        if (hasAd) {
            this._ad = new OfficialRoomEntryData(wrapper);
        }
    }

    get searchType(): number {
        return this._searchType;
    }

    get searchParam(): string {
        return this._searchParam;
    }

    get rooms(): GuestRoomData[] {
        return this._rooms;
    }

    get ad(): OfficialRoomEntryData | null {
        return this._ad;
    }

    get disposed(): boolean {
        return this._disposed;
    }

    dispose(): void {
        if (this._disposed) {
            return;
        }
        this._disposed = true;

        for (const room of this._rooms) {
            room.dispose();
        }
        this._rooms = [];

        if (this._ad) {
            this._ad.dispose();
            this._ad = null;
        }
    }
}
