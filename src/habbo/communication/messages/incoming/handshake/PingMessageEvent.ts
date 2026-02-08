import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {PingMessageParser} from '../../parser/handshake/PingMessageParser';

/**
 * Event handler for Ping message (keep-alive)
 * Message ID: 658
 *
 * @see source_as_win63/habbo/communication/messages/incoming/handshake/PingMessageEvent.as
 */
export class PingMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, PingMessageParser);
	}
}
