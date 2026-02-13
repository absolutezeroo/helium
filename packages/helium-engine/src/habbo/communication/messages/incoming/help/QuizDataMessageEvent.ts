import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {QuizDataMessageParser} from '../../parser/help/QuizDataMessageParser';

/**
 * Event fired when quiz data is received.
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/help/QuizDataMessageEvent.as
 */
export class QuizDataMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callBack: Function)
	{
		super(callBack, QuizDataMessageParser);
	}

	get parser(): QuizDataMessageParser
	{
		return this.getParser() as QuizDataMessageParser;
	}
}
