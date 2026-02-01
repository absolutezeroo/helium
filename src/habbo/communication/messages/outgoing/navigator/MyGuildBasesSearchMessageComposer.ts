import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Search my guild bases
 *
 * Based on AS3 MyGuildBasesSearchMessageComposer
 */
export class MyGuildBasesSearchMessageComposer implements IMessageComposer {
    getMessageArray(): unknown[] {
        return [];
    }

    dispose(): void {
        // Nothing to dispose
    }
}
