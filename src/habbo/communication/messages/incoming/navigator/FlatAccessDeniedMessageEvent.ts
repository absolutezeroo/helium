import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {FlatAccessDeniedMessageParser} from '../../parser/navigator/FlatAccessDeniedMessageParser';

export class FlatAccessDeniedMessageEvent extends MessageEvent {
    constructor(callback: MessageEventCallback) {
        super(callback, FlatAccessDeniedMessageParser);
    }
}
