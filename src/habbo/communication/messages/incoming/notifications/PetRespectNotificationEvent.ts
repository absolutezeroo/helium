import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {PetRespectNotificationEventParser} from '../../parser/notifications/PetRespectNotificationEventParser';

/**
 * Event for pet respect notification
 *
 * @see source_as/habbo/communication/messages/incoming/users/PetRespectNotificationEvent.as
 */
export class PetRespectNotificationEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, PetRespectNotificationEventParser);
	}
}
