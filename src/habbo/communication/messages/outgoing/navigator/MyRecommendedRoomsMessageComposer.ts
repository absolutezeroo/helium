import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Get my recommended rooms
 *
 * Based on AS3 MyRecommendedRoomsMessageComposer
 */
export class MyRecommendedRoomsMessageComposer implements IMessageComposer {
    getMessageArray(): unknown[] {
        return [];
    }

    dispose(): void {
        // Nothing to dispose
    }
}
