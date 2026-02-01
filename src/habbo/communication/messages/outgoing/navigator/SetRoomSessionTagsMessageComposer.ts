import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Set room session tags
 *
 * Based on AS3 SetRoomSessionTagsMessageComposer
 */
export class SetRoomSessionTagsMessageComposer implements IMessageComposer {
    private _data: unknown[];

    constructor(tag1: string, tag2: string) {
        this._data = [tag1, tag2];
    }

    getMessageArray(): unknown[] {
        return this._data;
    }

    dispose(): void {
        // Nothing to dispose
    }
}
