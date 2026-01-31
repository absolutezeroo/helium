import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Send SSO ticket for authentication
 */
export class SSOTicketMessageComposer implements IMessageComposer {
    private ssoTicket: string;
    private time: number;

    constructor(ssoTicket: string, time: number = 0) {
        this.ssoTicket = ssoTicket;
        this.time = time;
    }

    getMessageArray(): unknown[] {
        return [this.ssoTicket, this.time];
    }

    dispose(): void {
        // Nothing to dispose
    }
}
