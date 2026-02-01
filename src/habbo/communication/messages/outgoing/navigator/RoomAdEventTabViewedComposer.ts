import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Room ad event tab viewed
 *
 * Based on AS3 RoomAdEventTabViewedComposer
 */
export class RoomAdEventTabViewedComposer implements IMessageComposer {
    getMessageArray(): unknown[] {
        return [];
    }

    dispose(): void {
        // Nothing to dispose
    }
}
