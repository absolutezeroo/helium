import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {GuestRoomSearchResultMessageParser} from '../../parser/navigator/GuestRoomSearchResultMessageParser';

export class GuestRoomSearchResultMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, GuestRoomSearchResultMessageParser);
	}
}
