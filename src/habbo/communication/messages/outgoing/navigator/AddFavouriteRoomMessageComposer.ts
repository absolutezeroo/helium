import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Add a room to favourites
 *
 * Based on AS3 AddFavouriteRoomMessageComposer
 */
export class AddFavouriteRoomMessageComposer implements IMessageComposer {
    private _data: unknown[];

    constructor(roomId: number) {
        this._data = [roomId];
    }

    getMessageArray(): unknown[] {
        return this._data;
    }

    dispose(): void {
        // Nothing to dispose
    }
}
