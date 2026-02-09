import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {RoomInfoUpdatedMessageParser} from '../../parser/navigator/RoomInfoUpdatedMessageParser';

/**
 * @see source_as_win63/habbo/communication/messages/incoming/navigator/RoomInfoUpdatedEvent.as
 */
export class RoomInfoUpdatedMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, RoomInfoUpdatedMessageParser);
	}
}
