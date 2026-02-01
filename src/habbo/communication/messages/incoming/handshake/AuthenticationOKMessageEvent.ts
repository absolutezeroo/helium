import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {AuthenticationOKMessageParser} from '../../parser/handshake/AuthenticationOKMessageParser';

/**
 * Event handler for AuthenticationOK message
 *
 * @see source_as/habbo/communication/messages/incoming/handshake/AuthenticationOKMessageEvent.as
 */
export class AuthenticationOKMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, AuthenticationOKMessageParser);
	}
}
