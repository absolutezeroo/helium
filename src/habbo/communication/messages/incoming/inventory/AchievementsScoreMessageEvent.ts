import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {AchievementsScoreMessageParser} from '../../parser/inventory/AchievementsScoreMessageParser';

/**
 * Event handler for AchievementsScore message
 *
 * @see source_as/habbo/communication/messages/incoming/inventory/achievements/AchievementsScoreEvent.as
 */
export class AchievementsScoreMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, AchievementsScoreMessageParser);
	}
}
