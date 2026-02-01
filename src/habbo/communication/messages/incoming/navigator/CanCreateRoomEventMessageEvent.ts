import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {CanCreateRoomEventMessageParser} from '../../parser/navigator/CanCreateRoomEventMessageParser';

export class CanCreateRoomEventMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, CanCreateRoomEventMessageParser);
	}
}
