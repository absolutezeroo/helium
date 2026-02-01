import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Edit a room event
 *
 * Based on AS3 EditEventMessageComposer
 */
export class EditEventMessageComposer implements IMessageComposer {
    private _data: unknown[];

    constructor(categoryId: number, eventName: string, eventDescription: string) {
        this._data = [categoryId, eventName, eventDescription];
    }

    getMessageArray(): unknown[] {
        return this._data;
    }

    dispose(): void {
        // Nothing to dispose
    }
}
