import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {FlatCreatedMessageParser} from '../../parser/navigator/FlatCreatedMessageParser';

export class FlatCreatedMessageEvent extends MessageEvent {
    constructor(callback: MessageEventCallback) {
        super(callback, FlatCreatedMessageParser);
    }
}
