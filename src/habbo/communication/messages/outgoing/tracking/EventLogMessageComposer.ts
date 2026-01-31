import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Send event log for tracking
 * Message ID: 2297
 */
export class EventLogMessageComposer implements IMessageComposer {
    private category: string;
    private type: string;
    private action: string;
    private extraString: string;
    private extraInt: number;

    constructor(
        category: string,
        type: string,
        action: string,
        extraString: string = '',
        extraInt: number = 0
    ) {
        this.category = category || '';
        this.type = type || '';
        this.action = action || '';
        this.extraString = extraString || '';
        this.extraInt = extraInt || 0;
    }

    getMessageArray(): unknown[] {
        return [
            this.category,
            this.type,
            this.action,
            this.extraString,
            this.extraInt
        ];
    }

    dispose(): void {
        // Nothing to dispose
    }
}
