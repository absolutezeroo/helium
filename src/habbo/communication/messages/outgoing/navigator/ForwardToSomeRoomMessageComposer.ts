import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Forward to some room
 *
 * Based on AS3 ForwardToSomeRoomMessageComposer
 */
export class ForwardToSomeRoomMessageComposer implements IMessageComposer {
    private _data: unknown[];

    constructor(roomType: string) {
        this._data = [roomType];
    }

    getMessageArray(): unknown[] {
        return this._data;
    }

    dispose(): void {
        // Nothing to dispose
    }
}
