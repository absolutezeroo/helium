import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {ChatReviewSessionResultsMessageParser} from '../../parser/help/ChatReviewSessionResultsMessageParser';

/**
 * Event fired when chat review session results are received.
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/help/ChatReviewSessionResultsMessageEvent.as
 */
export class ChatReviewSessionResultsMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callBack: Function)
	{
		super(callBack, ChatReviewSessionResultsMessageParser);
	}

	get parser(): ChatReviewSessionResultsMessageParser
	{
		return this.getParser() as ChatReviewSessionResultsMessageParser;
	}
}
