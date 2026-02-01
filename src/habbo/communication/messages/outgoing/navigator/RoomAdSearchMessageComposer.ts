import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Search room ads
 *
 * Based on AS3 RoomAdSearchMessageComposer
 */
export class RoomAdSearchMessageComposer implements IMessageComposer {
    private _data: unknown[];

    constructor(categoryId: number, index: number) {
        this._data = [categoryId, index];
    }

    getMessageArray(): unknown[] {
        return this._data;
    }

    dispose(): void {
        // Nothing to dispose
    }
}
