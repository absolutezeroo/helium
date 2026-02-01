import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Search my room history
 *
 * Based on AS3 MyRoomHistorySearchMessageComposer
 */
export class MyRoomHistorySearchMessageComposer implements IMessageComposer {
    getMessageArray(): unknown[] {
        return [];
    }

    dispose(): void {
        // Nothing to dispose
    }
}
