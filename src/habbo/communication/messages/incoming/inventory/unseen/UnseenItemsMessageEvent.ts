import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {UnseenItemsMessageParser} from '../../../parser/inventory/unseen/UnseenItemsMessageParser';

export class UnseenItemsMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, UnseenItemsMessageParser);
	}
}
