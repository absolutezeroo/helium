import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Get user's event categories
 *
 * Based on AS3 GetUserEventCatsMessageComposer
 */
export class GetUserEventCatsMessageComposer implements IMessageComposer {
    getMessageArray(): unknown[] {
        return [];
    }

    dispose(): void {
        // Nothing to dispose
    }
}
