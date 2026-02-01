import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Removes a collapsed category from the navigator
 *
 * Based on AS3 NavigatorRemoveCollapsedCategoryMessageComposer
 */
export class NavigatorRemoveCollapsedCategoryMessageComposer implements IMessageComposer {
    private _data: unknown[];

    constructor(category: string) {
        this._data = [category];
    }

    getMessageArray(): unknown[] {
        return this._data;
    }

    dispose(): void {
        // Nothing to dispose
    }
}
