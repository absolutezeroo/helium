import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {PetInventoryMessageParser} from '../../../parser/inventory/pets/PetInventoryMessageParser';

export class PetInventoryMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, PetInventoryMessageParser);
	}
}
