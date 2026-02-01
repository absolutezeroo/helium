import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Update home room
 *
 * Based on AS3 UpdateHomeRoomMessageComposer
 */
export class UpdateHomeRoomMessageComposer implements IMessageComposer {
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
