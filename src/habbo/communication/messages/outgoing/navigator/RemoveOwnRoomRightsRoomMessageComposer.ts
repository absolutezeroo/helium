import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Remove own room rights
 *
 * Based on AS3 RemoveOwnRoomRightsRoomMessageComposer
 */
export class RemoveOwnRoomRightsRoomMessageComposer implements IMessageComposer {
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
