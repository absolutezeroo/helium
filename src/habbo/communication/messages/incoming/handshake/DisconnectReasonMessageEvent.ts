import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {DisconnectReasonMessageParser} from '../../parser/handshake/DisconnectReasonMessageParser';

/**
 * Event handler for Disconnect reason message
 * Message ID: 4000
 *
 * @see source_as_win63/habbo/communication/messages/incoming/handshake/DisconnectReasonEvent.as
 */
export class DisconnectReasonMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, DisconnectReasonMessageParser);
	}
}
