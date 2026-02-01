import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {GetGuestRoomResultMessageParser} from '../../parser/navigator/GetGuestRoomResultMessageParser';

export class GetGuestRoomResultMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, GetGuestRoomResultMessageParser);
	}
}
