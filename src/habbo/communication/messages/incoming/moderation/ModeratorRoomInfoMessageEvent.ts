import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ModeratorRoomInfoParser} from '../../parser/moderation/ModeratorRoomInfoParser';

/**
 * Event for moderator room info data.
 *
 * @see source_as/habbo/communication/messages/incoming/moderation/ModeratorRoomInfoEvent.as
 */
export class ModeratorRoomInfoMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, ModeratorRoomInfoParser);
	}
}
