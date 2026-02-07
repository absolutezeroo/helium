import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {MOTDNotificationEventParser} from '../../parser/notifications/MOTDNotificationEventParser';

/**
 * Event for Message of the Day notification
 *
 * @see source_as/habbo/communication/messages/incoming/notifications/MOTDNotificationEvent.as
 */
export class MOTDNotificationEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, MOTDNotificationEventParser);
	}
}
