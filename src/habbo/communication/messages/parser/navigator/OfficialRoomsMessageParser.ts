import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {OfficialRoomsData, OfficialRoomEntryData, PromotedRoomsData} from '../../incoming/navigator';

/**
 * Parser for official rooms message
 *
 * Based on AS3 OfficialRoomsEventParser
 */
export class OfficialRoomsMessageParser implements IMessageParser {
    private _data: OfficialRoomsData | null = null;
    private _adRoom: OfficialRoomEntryData | null = null;
    private _promotedRooms: PromotedRoomsData | null = null;

    get data(): OfficialRoomsData | null {
        return this._data;
    }

    get adRoom(): OfficialRoomEntryData | null {
        return this._adRoom;
    }

    get promotedRooms(): PromotedRoomsData | null {
        return this._promotedRooms;
    }

    flush(): boolean {
        this._data = null;
        this._adRoom = null;
        this._promotedRooms = null;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean {
        this._data = new OfficialRoomsData(wrapper);

        const adRoomCount = wrapper.readInt();
        if (adRoomCount > 0) {
            this._adRoom = new OfficialRoomEntryData(wrapper);
        }

        this._promotedRooms = new PromotedRoomsData(wrapper);

        return true;
    }
}
