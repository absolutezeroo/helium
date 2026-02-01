import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Sets the view mode for a search code in the navigator
 *
 * Based on AS3 NavigatorSetSearchCodeViewModeMessageComposer
 */
export class NavigatorSetSearchCodeViewModeMessageComposer implements IMessageComposer {
    private _data: unknown[];

    constructor(searchCode: string, viewMode: number) {
        this._data = [searchCode, viewMode];
    }

    getMessageArray(): unknown[] {
        return this._data;
    }

    dispose(): void {
        // Nothing to dispose
    }
}
