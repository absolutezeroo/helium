import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {UserEventCatsMessageParser} from '../../parser/navigator/UserEventCatsMessageParser';

export class UserEventCatsMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, UserEventCatsMessageParser);
	}
}
