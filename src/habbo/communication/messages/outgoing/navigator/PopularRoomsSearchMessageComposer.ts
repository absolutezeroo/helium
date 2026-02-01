import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Search popular rooms
 *
 * Based on AS3 PopularRoomsSearchMessageComposer
 */
export class PopularRoomsSearchMessageComposer implements IMessageComposer {
    private _data: unknown[];

    constructor(category: string, index: number) {
        this._data = [category, index];
    }

    getMessageArray(): unknown[] {
        return this._data;
    }

    dispose(): void {
        // Nothing to dispose
    }
}
