import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Complete Diffie-Hellman key exchange with our public key
 * Message ID: 2616
 */
export class CompleteDiffieHandshakeMessageComposer implements IMessageComposer {
    private publicKey: string;

    constructor(publicKey: string) {
        this.publicKey = publicKey;
    }

    getMessageArray(): unknown[] {
        return [this.publicKey];
    }

    dispose(): void {
        // Nothing to dispose
    }
}
