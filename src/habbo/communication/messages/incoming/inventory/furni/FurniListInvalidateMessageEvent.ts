import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {FurniListInvalidateMessageParser} from '@habbo/communication/messages/parser/inventory/furni/FurniListInvalidateMessageParser';

/**
 * @see source_as/habbo/communication/messages/incoming/inventory/furni/FurniListInvalidateEvent.as
 */
export class FurniListInvalidateMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, FurniListInvalidateMessageParser);
	}
}
