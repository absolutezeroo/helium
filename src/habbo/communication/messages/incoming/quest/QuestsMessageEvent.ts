import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {QuestsMessageEventParser} from '../../parser/quest/QuestsMessageEventParser';

/**
 * Event for the quests list message from the server.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/quest/QuestsMessageEvent.as
 */
export class QuestsMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, QuestsMessageEventParser);
	}
}
