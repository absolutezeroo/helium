import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Search my favourite rooms
 *
 * Based on AS3 MyFavouriteRoomsSearchMessageComposer
 */
export class MyFavouriteRoomsSearchMessageComposer implements IMessageComposer {
    getMessageArray(): unknown[] {
        return [];
    }

    dispose(): void {
        // Nothing to dispose
    }
}
