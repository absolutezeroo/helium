import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Search my friends' rooms
 *
 * Based on AS3 MyFriendsRoomsSearchMessageComposer
 */
export class MyFriendsRoomsSearchMessageComposer implements IMessageComposer {
    getMessageArray(): unknown[] {
        return [];
    }

    dispose(): void {
        // Nothing to dispose
    }
}
