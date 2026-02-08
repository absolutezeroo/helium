import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {RoomEventCancelMessageParser} from '../../parser/navigator/RoomEventCancelMessageParser';

/**
 * @see source_as_win63/habbo/communication/messages/incoming/navigator/RoomEventCancelEvent.as
 */
export class RoomEventCancelMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, RoomEventCancelMessageParser);
	}
}
