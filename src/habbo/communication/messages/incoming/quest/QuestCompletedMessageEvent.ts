import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {QuestCompletedMessageEventParser} from '../../parser/quest/QuestCompletedMessageEventParser';

/**
 * Event for the quest completed message from the server.
 *
 * @see source_as/habbo/communication/messages/incoming/quest/QuestCompletedMessageEvent.as
 */
export class QuestCompletedMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, QuestCompletedMessageEventParser);
	}
}
