/**
 * ExpressionMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.action.ExpressionMessageEvent
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
	ExpressionMessageEventParser
} from '@habbo/communication/messages/parser/room/action/ExpressionMessageEventParser';

export class ExpressionMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, ExpressionMessageEventParser);
	}
}
