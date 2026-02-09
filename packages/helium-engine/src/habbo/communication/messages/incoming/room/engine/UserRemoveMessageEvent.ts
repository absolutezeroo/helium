/**
 * UserRemoveMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.engine.UserRemoveMessageEvent
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {UserRemoveMessageParser} from '@habbo/communication/messages/parser/room/engine/UserRemoveMessageParser';

export class UserRemoveMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, UserRemoveMessageParser);
	}
}
