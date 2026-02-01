import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {RoomInfoUpdatedMessageParser} from '../../parser/navigator/RoomInfoUpdatedMessageParser';

export class RoomInfoUpdatedMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, RoomInfoUpdatedMessageParser);
	}
}
