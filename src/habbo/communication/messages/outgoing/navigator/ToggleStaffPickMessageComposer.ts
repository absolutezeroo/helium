import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Toggle staff pick status
 *
 * Based on AS3 ToggleStaffPickMessageComposer
 */
export class ToggleStaffPickMessageComposer implements IMessageComposer {
    private _data: unknown[];

    constructor(roomId: number, picked: boolean) {
        this._data = [roomId, picked];
    }

    getMessageArray(): unknown[] {
        return this._data;
    }

    dispose(): void {
        // Nothing to dispose
    }
}
