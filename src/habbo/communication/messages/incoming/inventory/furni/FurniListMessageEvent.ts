import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {FurniListMessageParser} from '@habbo/communication/messages/parser/inventory/furni/FurniListMessageParser';

/**
 * @see source_as/habbo/communication/messages/incoming/inventory/furni/FurniListEvent.as
 */
export class FurniListMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, FurniListMessageParser);
	}
}
