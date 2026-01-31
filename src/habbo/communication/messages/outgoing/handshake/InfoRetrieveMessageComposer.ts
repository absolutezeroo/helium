import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Request user info after authentication
 */
export class InfoRetrieveMessageComposer implements IMessageComposer {
    getMessageArray(): unknown[] {
        return [];
    }

    dispose(): void {
        // Nothing to dispose
    }
}
