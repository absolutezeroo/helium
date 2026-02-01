import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Search rooms by text
 *
 * Based on AS3 RoomTextSearchMessageComposer
 */
export class RoomTextSearchMessageComposer implements IMessageComposer {
    private _data: unknown[];

    constructor(searchText: string) {
        this._data = [searchText];
    }

    getMessageArray(): unknown[] {
        return this._data;
    }

    dispose(): void {
        // Nothing to dispose
    }
}
