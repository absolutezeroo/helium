import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {NewConsoleMessageEventParser} from '../../parser/friendlist/NewConsoleMessageEventParser';

/**
 * Event handler for new console (messenger) messages.
 * Fired when a new message is received in a conversation.
 *
 * @see source_as/habbo/communication/messages/incoming/friendlist/NewConsoleMessageEvent.as
 */
export class NewConsoleMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, NewConsoleMessageEventParser);
	}
}
