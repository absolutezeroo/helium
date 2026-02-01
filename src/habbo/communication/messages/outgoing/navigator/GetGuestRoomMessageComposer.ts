import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Get guest room information
 *
 * Based on AS3 GetGuestRoomMessageComposer
 */
export class GetGuestRoomMessageComposer implements IMessageComposer {
    private _data: unknown[];

    constructor(roomId: number, enterRoom: boolean, roomForward: boolean) {
        this._data = [roomId, enterRoom ? 1 : 0, roomForward ? 1 : 0];
    }

    getMessageArray(): unknown[] {
        return this._data;
    }

    dispose(): void {
        // Nothing to dispose
    }
}
