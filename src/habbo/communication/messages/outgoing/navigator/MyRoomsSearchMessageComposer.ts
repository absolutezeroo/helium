import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Search my own rooms
 *
 * Based on AS3 MyRoomsSearchMessageComposer
 */
export class MyRoomsSearchMessageComposer implements IMessageComposer {
    getMessageArray(): unknown[] {
        return [];
    }

    dispose(): void {
        // Nothing to dispose
    }
}
