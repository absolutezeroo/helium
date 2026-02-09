import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ClubGiftNotificationEventParser} from '../../parser/notifications/ClubGiftNotificationEventParser';

/**
 * Event for club gift notification
 *
 * @see source_as_win63/habbo/communication/messages/incoming/notifications/ClubGiftNotificationEvent.as
 */
export class ClubGiftNotificationEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, ClubGiftNotificationEventParser);
	}
}
