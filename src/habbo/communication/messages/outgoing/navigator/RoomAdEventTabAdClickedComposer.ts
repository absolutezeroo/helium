import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Room ad event tab ad clicked
 *
 * Based on AS3 RoomAdEventTabAdClickedComposer
 */
export class RoomAdEventTabAdClickedComposer implements IMessageComposer {
    private _data: unknown[];

    constructor(roomId: number, adName: string, adId: number) {
        this._data = [roomId, adName, adId];
    }

    getMessageArray(): unknown[] {
        return this._data;
    }

    dispose(): void {
        // Nothing to dispose
    }
}
