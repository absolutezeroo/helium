import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {UserObjectMessageParser} from '../../parser/handshake/UserObjectMessageParser';

/**
 * Event handler for User object data message
 */
export class UserObjectMessageEvent extends MessageEvent {
    constructor(callback: MessageEventCallback) {
        super(callback, UserObjectMessageParser);
    }
}
