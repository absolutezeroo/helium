import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {RoomEventMessageParser} from '../../parser/navigator/RoomEventMessageParser';

/**
 * Event handler for RoomEvent message
 *
 * @see source_as_win63/habbo/communication/messages/incoming/navigator/RoomEventEvent.as
 */
export class RoomEventMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, RoomEventMessageParser);
	}
}
