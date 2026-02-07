import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {PetReceivedMessageEventParser} from '../../parser/notifications/PetReceivedMessageEventParser';

/**
 * Event for pet received message
 *
 * @see source_as/habbo/communication/messages/incoming/inventory/pets/PetReceivedMessageEvent.as
 */
export class PetReceivedMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, PetReceivedMessageEventParser);
	}
}
