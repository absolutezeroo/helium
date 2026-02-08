import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {PollContentsEventParser} from '../../parser/poll/PollContentsEventParser';

/**
 * Poll contents event
 *
 * @see source_as_win63/habbo/communication/messages/incoming/poll/PollContentsEvent.as
 */
export class PollContentsEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, PollContentsEventParser);
	}
}
