import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Request to disconnect from server
 * Message ID: 1113
 */
export class DisconnectMessageComposer implements IMessageComposer {
    getMessageArray(): unknown[] {
        return [];
    }

    dispose(): void {
        // Nothing to dispose
    }
}
