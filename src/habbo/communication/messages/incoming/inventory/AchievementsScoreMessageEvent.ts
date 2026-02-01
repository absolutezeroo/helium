import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {AchievementsScoreMessageParser} from '../../parser/inventory/AchievementsScoreMessageParser';

export class AchievementsScoreMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, AchievementsScoreMessageParser);
	}
}
