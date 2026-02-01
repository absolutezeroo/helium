import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Remove a room from favourites
 *
 * Based on AS3 DeleteFavouriteRoomMessageComposer
 */
export class DeleteFavouriteRoomMessageComposer implements IMessageComposer {
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
