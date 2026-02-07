import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {PetRespectFailedEventParser} from '../../parser/notifications/PetRespectFailedEventParser';

/**
 * Event for pet respect failed
 *
 * @see source_as/habbo/communication/messages/incoming/room/pets/PetRespectFailedEvent.as
 */
export class PetRespectFailedEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, PetRespectFailedEventParser);
	}
}
