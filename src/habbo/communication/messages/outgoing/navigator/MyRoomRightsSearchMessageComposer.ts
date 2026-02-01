import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Search rooms where I have rights
 *
 * Based on AS3 MyRoomRightsSearchMessageComposer
 */
export class MyRoomRightsSearchMessageComposer implements IMessageComposer {
    getMessageArray(): unknown[] {
        return [];
    }

    dispose(): void {
        // Nothing to dispose
    }
}
