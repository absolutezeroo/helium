import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {PetInventoryMessageParser} from '@habbo/communication/messages/parser/inventory/pets/PetInventoryMessageParser';

/**
 * @see source_as/habbo/communication/messages/incoming/inventory/pets/PetInventoryEvent.as
 */
export class PetInventoryMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, PetInventoryMessageParser);
	}
}
