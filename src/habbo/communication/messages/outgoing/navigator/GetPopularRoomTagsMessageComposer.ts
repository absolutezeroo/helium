import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Get popular room tags
 *
 * Based on AS3 GetPopularRoomTagsMessageComposer
 */
export class GetPopularRoomTagsMessageComposer implements IMessageComposer {
    getMessageArray(): unknown[] {
        return [];
    }

    dispose(): void {
        // Nothing to dispose
    }
}
