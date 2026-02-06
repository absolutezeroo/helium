/**
 * CloseConnectionMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.session.CloseConnectionMessageEvent
 *
 * Sent when the room connection should be closed.
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CloseConnectionMessageParser} from '@habbo/communication/messages/parser/room/session/CloseConnectionMessageParser';

export class CloseConnectionMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, CloseConnectionMessageParser);
	}
}
