import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CanCreateRoomEventMessageParser} from '../../parser/navigator/CanCreateRoomEventMessageParser';

/**
 * Event handler for CanCreateRoomEvent message
 *
 * @see source_as_win63/habbo/communication/messages/incoming/navigator/CanCreateRoomEventEvent.as
 */
export class CanCreateRoomEventMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, CanCreateRoomEventMessageParser);
	}
}
