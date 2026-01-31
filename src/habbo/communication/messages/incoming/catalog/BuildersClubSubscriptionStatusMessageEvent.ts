import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    BuildersClubSubscriptionStatusMessageParser
} from '../../parser/catalog/BuildersClubSubscriptionStatusMessageParser';

export class BuildersClubSubscriptionStatusMessageEvent extends MessageEvent {
    constructor(callback: MessageEventCallback) {
        super(callback, BuildersClubSubscriptionStatusMessageParser);
    }
}
