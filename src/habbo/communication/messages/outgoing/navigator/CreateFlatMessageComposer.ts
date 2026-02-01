import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Create a new flat/room
 *
 * Based on AS3 CreateFlatMessageComposer
 */
export class CreateFlatMessageComposer implements IMessageComposer {
    private _data: unknown[];

    constructor(
        roomName: string,
        roomDescription: string,
        roomModel: string,
        categoryId: number,
        maxUsers: number,
        tradeMode: number
    ) {
        this._data = [roomName, roomDescription, roomModel, categoryId, maxUsers, tradeMode];
    }

    getMessageArray(): unknown[] {
        return this._data;
    }

    dispose(): void {
        // Nothing to dispose
    }
}
