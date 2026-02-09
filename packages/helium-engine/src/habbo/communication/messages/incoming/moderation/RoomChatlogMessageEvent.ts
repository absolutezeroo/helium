import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {RoomChatlogMessageParser} from '../../parser/moderation/RoomChatlogMessageParser';

/**
 * Event for room chatlog data.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/moderation/RoomChatlogEvent.as
 */
export class RoomChatlogMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, RoomChatlogMessageParser);
	}
}
