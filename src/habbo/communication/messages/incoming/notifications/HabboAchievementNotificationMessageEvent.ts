import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {HabboAchievementNotificationMessageEventParser} from '../../parser/notifications/HabboAchievementNotificationMessageEventParser';

/**
 * Event for Habbo achievement notification message
 *
 * @see source_as/habbo/communication/messages/incoming/notifications/HabboAchievementNotificationMessageEvent.as
 */
export class HabboAchievementNotificationMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, HabboAchievementNotificationMessageEventParser);
	}
}
