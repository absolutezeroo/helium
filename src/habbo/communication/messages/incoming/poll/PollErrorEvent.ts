import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {PollErrorEventParser} from '../../parser/poll/PollErrorEventParser';

/**
 * Poll error event
 *
 * @see source_as/habbo/communication/messages/incoming/poll/PollErrorEvent.as
 */
export class PollErrorEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, PollErrorEventParser);
	}
}
