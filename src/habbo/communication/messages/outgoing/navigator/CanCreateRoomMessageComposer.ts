import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Check if user can create a room
 *
 * Based on AS3 CanCreateRoomMessageComposer
 */
export class CanCreateRoomMessageComposer implements IMessageComposer {
    getMessageArray(): unknown[] {
        return [];
    }

    dispose(): void {
        // Nothing to dispose
    }
}
