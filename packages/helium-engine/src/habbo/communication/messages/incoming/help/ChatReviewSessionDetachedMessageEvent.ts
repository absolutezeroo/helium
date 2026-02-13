import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {ChatReviewSessionDetachedMessageParser} from '../../parser/help/ChatReviewSessionDetachedMessageParser';

/**
 * Event fired when a chat review session is detached.
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/help/ChatReviewSessionDetachedMessageEvent.as
 */
export class ChatReviewSessionDetachedMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callBack: Function)
	{
		super(callBack, ChatReviewSessionDetachedMessageParser);
	}

	get parser(): ChatReviewSessionDetachedMessageParser
	{
		return this.getParser() as ChatReviewSessionDetachedMessageParser;
	}
}
