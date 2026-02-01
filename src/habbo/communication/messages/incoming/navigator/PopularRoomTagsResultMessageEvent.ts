import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {PopularRoomTagsResultMessageParser} from '../../parser/navigator/PopularRoomTagsResultMessageParser';

export class PopularRoomTagsResultMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, PopularRoomTagsResultMessageParser);
	}
}
