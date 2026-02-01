import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Rate a flat/room
 *
 * Based on AS3 RateFlatMessageComposer
 */
export class RateFlatMessageComposer implements IMessageComposer {
    private _data: unknown[];

    constructor(rating: number) {
        this._data = [rating];
    }

    getMessageArray(): unknown[] {
        return this._data;
    }

    dispose(): void {
        // Nothing to dispose
    }
}
