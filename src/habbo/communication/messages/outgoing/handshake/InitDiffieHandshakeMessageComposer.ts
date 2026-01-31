import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Request to start Diffie-Hellman key exchange
 * Message ID: 586
 */
export class InitDiffieHandshakeMessageComposer implements IMessageComposer {
    getMessageArray(): unknown[] {
        return [];
    }

    dispose(): void {
        // Nothing to dispose
    }
}
