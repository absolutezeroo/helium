import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';


/**
 * Sent when the navigator is initialized to request metadata
 *
 * Based on AS3 com.sulake.habbo.communication.messages.outgoing.newnavigator.NewNavigatorInitComposer
 */
export class NewNavigatorInitComposer implements IMessageComposer {
    private _data: unknown[];

    constructor() {
        this._data = [];
    }

    getMessageArray(): unknown[] {
        return this._data;
    }

    dispose(): void {
        // Nothing to dispose
    }
}
