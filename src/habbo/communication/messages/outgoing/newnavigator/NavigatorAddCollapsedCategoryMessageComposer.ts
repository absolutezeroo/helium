import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Adds a collapsed category to the navigator
 *
 * Based on AS3 NavigatorAddCollapsedCategoryMessageComposer
 */
export class NavigatorAddCollapsedCategoryMessageComposer implements IMessageComposer {
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
