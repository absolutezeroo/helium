import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {RoomRatingMessageParser} from '../../parser/navigator/RoomRatingMessageParser';

/**
 * Event handler for RoomRating message
 *
 * @see source_as/habbo/communication/messages/incoming/navigator/RoomRatingEvent.as
 */
export class RoomRatingMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, RoomRatingMessageParser);
	}
}
