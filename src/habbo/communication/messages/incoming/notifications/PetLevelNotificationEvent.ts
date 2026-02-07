import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {PetLevelNotificationEventParser} from '../../parser/notifications/PetLevelNotificationEventParser';

/**
 * Event for pet level notification
 *
 * @see source_as/habbo/communication/messages/incoming/notifications/PetLevelNotificationEvent.as
 */
export class PetLevelNotificationEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, PetLevelNotificationEventParser);
	}
}
