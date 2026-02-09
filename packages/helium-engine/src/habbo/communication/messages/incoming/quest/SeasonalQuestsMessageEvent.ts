import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {SeasonalQuestsMessageEventParser} from '../../parser/quest/SeasonalQuestsMessageEventParser';

/**
 * Event for the seasonal quests list message from the server.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/quest/SeasonalQuestsMessageEvent.as
 */
export class SeasonalQuestsMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, SeasonalQuestsMessageEventParser);
	}
}
