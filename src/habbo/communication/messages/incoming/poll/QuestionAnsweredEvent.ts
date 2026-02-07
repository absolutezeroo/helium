import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {QuestionAnsweredEventParser} from '../../parser/poll/QuestionAnsweredEventParser';

/**
 * Question answered event (word quiz)
 *
 * @see source_as/habbo/communication/messages/incoming/poll/QuestionAnsweredEvent.as
 */
export class QuestionAnsweredEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, QuestionAnsweredEventParser);
	}
}
