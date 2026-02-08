import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
	AchievementResolutionsMessageEventParser
} from '../../../parser/game/lobby/AchievementResolutionsMessageEventParser';

/**
 * Event for the achievement resolutions list message.
 * Contains a list of resolution achievements with a stuff ID and end time.
 *
 * @see source_as/habbo/communication/messages/incoming/game/lobby/AchievementResolutionsMessageEvent.as
 */
export class AchievementResolutionsMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, AchievementResolutionsMessageEventParser);
	}
}
