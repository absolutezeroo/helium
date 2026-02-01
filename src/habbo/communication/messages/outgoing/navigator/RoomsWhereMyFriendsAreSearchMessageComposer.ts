import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Search rooms where my friends are
 *
 * Based on AS3 RoomsWhereMyFriendsAreSearchMessageComposer
 */
export class RoomsWhereMyFriendsAreSearchMessageComposer implements IMessageComposer {
    getMessageArray(): unknown[] {
        return [];
    }

    dispose(): void {
        // Nothing to dispose
    }
}
