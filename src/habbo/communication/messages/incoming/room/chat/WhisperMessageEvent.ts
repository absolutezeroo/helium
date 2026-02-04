/**
 * WhisperMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.chat.WhisperMessageEvent
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ChatMessageEventParser} from '../../../parser/room/chat/ChatMessageEventParser';

export class WhisperMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, ChatMessageEventParser);
	}
}
