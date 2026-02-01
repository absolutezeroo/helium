import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Search rooms with highest score
 *
 * Based on AS3 RoomsWithHighestScoreSearchMessageComposer
 */
export class RoomsWithHighestScoreSearchMessageComposer implements IMessageComposer {
    private _data: unknown[];

    constructor(categoryId: number) {
        this._data = [categoryId];
    }

    getMessageArray(): unknown[] {
        return this._data;
    }

    dispose(): void {
        // Nothing to dispose
    }
}
