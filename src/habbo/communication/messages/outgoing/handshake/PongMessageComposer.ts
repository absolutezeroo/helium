import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Response to server ping (keep-alive)
 */
export class PongMessageComposer implements IMessageComposer {
    getMessageArray(): unknown[] {
        return [];
    }

    dispose(): void {
        // Nothing to dispose
    }
}
