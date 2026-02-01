import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Convert global room ID
 *
 * Based on AS3 ConvertGlobalRoomIdMessageComposer
 */
export class ConvertGlobalRoomIdMessageComposer implements IMessageComposer {
    private _data: unknown[];

    constructor(flatId: string) {
        this._data = [flatId];
    }

    getMessageArray(): unknown[] {
        return this._data;
    }

    dispose(): void {
        // Nothing to dispose
    }
}
