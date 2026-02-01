import type {IMessageDataWrapper} from '@core/communication';
import type {INavigatorSearchResultData} from './INavigatorSearchResultData';
import {OfficialRoomEntryData} from './OfficialRoomEntryData';

/**
 * Official rooms data list
 *
 * Based on AS3 com.sulake.habbo.communication.messages.incoming.navigator.class_1663
 */
export class OfficialRoomsData implements INavigatorSearchResultData {
    private _entries: OfficialRoomEntryData[] = [];
    private _disposed: boolean = false;

    constructor(wrapper: IMessageDataWrapper) {
        const count = wrapper.readInt();
        for (let i = 0; i < count; i++) {
            this._entries.push(new OfficialRoomEntryData(wrapper));
        }
    }

    get entries(): OfficialRoomEntryData[] {
        return this._entries;
    }

    get disposed(): boolean {
        return this._disposed;
    }

    dispose(): void {
        if (this._disposed) {
            return;
        }
        this._disposed = true;

        for (const entry of this._entries) {
            entry.dispose();
        }
        this._entries = [];
    }
}
