import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Get user's flat categories
 *
 * Based on AS3 GetUserFlatCatsMessageComposer
 */
export class GetUserFlatCatsMessageComposer implements IMessageComposer {
    getMessageArray(): unknown[] {
        return [];
    }

    dispose(): void {
        // Nothing to dispose
    }
}
