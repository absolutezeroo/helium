import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Performs a search in the new navigator
 *
 * Based on AS3 com.sulake.habbo.communication.messages.outgoing.newnavigator.NewNavigatorSearchComposer
 */
export class NewNavigatorSearchComposer implements IMessageComposer {
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
