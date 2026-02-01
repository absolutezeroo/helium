import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {UserFlatCatsMessageParser} from '../../parser/navigator/UserFlatCatsMessageParser';

export class UserFlatCatsMessageEvent extends MessageEvent {
    constructor(callback: MessageEventCallback) {
        super(callback, UserFlatCatsMessageParser);
    }
}
