import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {QuestCancelledMessageEventParser} from '../../parser/quest/QuestCancelledMessageEventParser';

/**
 * Event for the quest cancelled message from the server.
 *
 * @see source_as/habbo/communication/messages/incoming/quest/QuestCancelledMessageEvent.as
 */
export class QuestCancelledMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, QuestCancelledMessageEventParser);
	}
}
