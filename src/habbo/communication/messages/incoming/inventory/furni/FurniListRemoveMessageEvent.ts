import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {FurniListRemoveMessageParser} from '@habbo/communication/messages/parser/inventory/furni/FurniListRemoveMessageParser';

/**
 * @see source_as/habbo/communication/messages/incoming/inventory/furni/FurniListRemoveEvent.as
 */
export class FurniListRemoveMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, FurniListRemoveMessageParser);
	}
}
