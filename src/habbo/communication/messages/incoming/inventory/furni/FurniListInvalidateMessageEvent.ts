import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {FurniListInvalidateMessageParser} from '../../../parser/inventory/furni/FurniListInvalidateMessageParser';

export class FurniListInvalidateMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, FurniListInvalidateMessageParser);
	}
}
