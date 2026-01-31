import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ActivityPointsMessageParser} from '../../parser/notifications/ActivityPointsMessageParser';

export class ActivityPointsMessageEvent extends MessageEvent {
    constructor(callback: MessageEventCallback) {
        super(callback, ActivityPointsMessageParser);
    }
}
