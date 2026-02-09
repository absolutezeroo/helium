import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {QuestionFinishedEventParser} from '../../parser/poll/QuestionFinishedEventParser';

/**
 * Question finished event (word quiz)
 *
 * @see source_as_win63/habbo/communication/messages/incoming/poll/QuestionFinishedEvent.as
 */
export class QuestionFinishedEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, QuestionFinishedEventParser);
	}
}
