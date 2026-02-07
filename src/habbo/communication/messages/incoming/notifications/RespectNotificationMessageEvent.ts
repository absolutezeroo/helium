import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {RespectNotificationMessageEventParser} from '../../parser/notifications/RespectNotificationMessageEventParser';

/**
 * Event for respect notification message
 *
 * @see source_as/habbo/communication/messages/incoming/users/RespectNotificationMessageEvent.as
 */
export class RespectNotificationMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, RespectNotificationMessageEventParser);
	}
}
