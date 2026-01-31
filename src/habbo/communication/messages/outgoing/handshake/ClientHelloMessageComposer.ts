import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * First message sent to server to initiate connection
 * Message ID: 4000
 */
export class ClientHelloMessageComposer implements IMessageComposer {
    private releaseVersion: string;
    private type: string;
    private platform: number;
    private category: number;

    constructor(
        releaseVersion: string = 'WIN63-202407091256-704579380',
        type: string = 'FLASH20',
        platform: number = 6,
        category: number = 4
    ) {
        this.releaseVersion = releaseVersion;
        this.type = type;
        this.platform = platform;
        this.category = category;
    }

    getMessageArray(): unknown[] {
        return [
            this.releaseVersion,
            this.type,
            this.platform,
            this.category
        ];
    }

    dispose(): void {
        // Nothing to dispose
    }
}
