/**
 * UserTypingMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.chat.UserTypingMessageEvent
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {UserTypingMessageEventParser} from '../../../parser/room/chat/UserTypingMessageEventParser';

export class UserTypingMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, UserTypingMessageEventParser);
	}
}
