import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Send client version information
 * Message ID: 2602
 */
export class VersionCheckMessageComposer implements IMessageComposer {
    private versionId: number;
    private clientUrl: string;
    private externalVariablesUrl: string;

    constructor(
        versionId: number = 0,
        clientUrl: string = '',
        externalVariablesUrl: string = ''
    ) {
        this.versionId = versionId;
        this.clientUrl = clientUrl;
        this.externalVariablesUrl = externalVariablesUrl;
    }

    getMessageArray(): unknown[] {
        return [
            this.versionId,
            this.clientUrl,
            this.externalVariablesUrl
        ];
    }

    dispose(): void {
        // Nothing to dispose
    }
}
