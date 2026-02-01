import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Cancel a room event
 *
 * Based on AS3 CancelEventMessageComposer
 */
export class CancelEventMessageComposer implements IMessageComposer {
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
