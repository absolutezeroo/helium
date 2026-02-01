import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Search my frequent room history
 *
 * Based on AS3 MyFrequentRoomHistorySearchMessageComposer
 */
export class MyFrequentRoomHistorySearchMessageComposer implements IMessageComposer {
    getMessageArray(): unknown[] {
        return [];
    }

    dispose(): void {
        // Nothing to dispose
    }
}
