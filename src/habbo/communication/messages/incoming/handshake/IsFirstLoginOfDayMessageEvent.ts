import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {IsFirstLoginOfDayMessageParser} from '../../parser/handshake/IsFirstLoginOfDayMessageParser';

export class IsFirstLoginOfDayMessageEvent extends MessageEvent {
    constructor(callback: MessageEventCallback) {
        super(callback, IsFirstLoginOfDayMessageParser);
    }
}
