import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Adds a saved search to the navigator
 */
export class NavigatorAddSavedSearchComposer implements IMessageComposer {
    private _data: unknown[];

    constructor(searchCode: string, filtering: string) {
        this._data = [searchCode, filtering];
    }

    getMessageArray(): unknown[] {
        return this._data;
    }

    dispose(): void {
        // Nothing to dispose
    }
}
