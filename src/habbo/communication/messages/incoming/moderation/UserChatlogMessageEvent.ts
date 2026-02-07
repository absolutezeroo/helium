import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {UserChatlogMessageParser} from '../../parser/moderation/UserChatlogMessageParser';

/**
 * Event for user chatlog data.
 *
 * @see source_as/habbo/communication/messages/incoming/moderation/UserChatlogEvent.as
 */
export class UserChatlogMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, UserChatlogMessageParser);
	}
}
