import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Send unique machine/device identification
 * Message ID: 1390
 */
export class UniqueIDMessageComposer implements IMessageComposer {
    private machineId: string;
    private fingerprint: string;
    private flashVersion: string;

    constructor(
        machineId: string = '',
        fingerprint: string = '',
        flashVersion: string = ''
    ) {
        this.machineId = machineId;
        this.fingerprint = fingerprint;
        this.flashVersion = flashVersion;
    }

    getMessageArray(): unknown[] {
        return [
            this.machineId,
            this.fingerprint,
            this.flashVersion
        ];
    }

    dispose(): void {
        // Nothing to dispose
    }
}
