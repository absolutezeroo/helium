/**
 * UseObjectMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.action.UseObjectMessageEvent
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
	UseObjectMessageEventParser
} from '@habbo/communication/messages/parser/room/action/UseObjectMessageEventParser';

export class UseObjectMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, UseObjectMessageEventParser);
	}
}
