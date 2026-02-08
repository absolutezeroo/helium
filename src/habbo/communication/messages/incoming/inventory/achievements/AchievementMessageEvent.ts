import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {AchievementEventParser} from '../../../parser/inventory/achievements/AchievementEventParser';

/**
 * Event for receiving a single achievement update.
 *
 * @see source_as/habbo/communication/messages/incoming/inventory/achievements/AchievementEvent.as
 */
export class AchievementMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, AchievementEventParser);
	}
}
