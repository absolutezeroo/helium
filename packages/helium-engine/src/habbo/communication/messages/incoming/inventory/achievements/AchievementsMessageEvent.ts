import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {AchievementsEventParser} from '../../../parser/inventory/achievements/AchievementsEventParser';

/**
 * Event for receiving the full list of achievements.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/inventory/achievements/AchievementsEvent.as
 */
export class AchievementsMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, AchievementsEventParser);
	}
}
