import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Get official rooms list
 *
 * Based on AS3 GetOfficialRoomsMessageComposer
 */
export class GetOfficialRoomsMessageComposer implements IMessageComposer {
    private _data: unknown[];

    constructor(index: number = 0) {
        this._data = [index];
    }

    getMessageArray(): unknown[] {
        return this._data;
    }

    dispose(): void {
        // Nothing to dispose
    }
}
