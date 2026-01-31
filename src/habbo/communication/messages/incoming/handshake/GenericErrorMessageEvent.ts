import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {GenericErrorMessageParser} from '../../parser/handshake/GenericErrorMessageParser';

/**
 * Event handler for Generic error message
 * Message ID: 598
 */
export class GenericErrorMessageEvent extends MessageEvent {
    constructor(callback: MessageEventCallback) {
        super(callback, GenericErrorMessageParser);
    }
}
