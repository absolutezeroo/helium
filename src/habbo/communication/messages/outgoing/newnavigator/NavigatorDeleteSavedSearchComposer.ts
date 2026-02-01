import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Deletes a saved search from the navigator
 */
export class NavigatorDeleteSavedSearchComposer implements IMessageComposer {
    private _data: unknown[];

    constructor(searchId: number) {
        this._data = [searchId];
    }

    getMessageArray(): unknown[] {
        return this._data;
    }

    dispose(): void {
        // Nothing to dispose
    }
}
