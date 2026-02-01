import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {GetGuestRoomResultMessageParser} from '../../parser/navigator/GetGuestRoomResultMessageParser';

/**
 * Event handler for GetGuestRoomResult message
 *
 * @see source_as/habbo/communication/messages/incoming/navigator/GetGuestRoomResultEvent.as
 */
export class GetGuestRoomResultMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, GetGuestRoomResultMessageParser);
	}
}
