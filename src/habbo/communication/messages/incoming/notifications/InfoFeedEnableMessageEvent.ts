import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {InfoFeedEnableMessageParser} from '../../parser/notifications/InfoFeedEnableMessageParser';

export class InfoFeedEnableMessageEvent extends MessageEvent {
    constructor(callback: MessageEventCallback) {
        super(callback, InfoFeedEnableMessageParser);
    }
}
