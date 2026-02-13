import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {
	ChatReviewSessionOfferedToGuideMessageParser
} from '../../parser/help/ChatReviewSessionOfferedToGuideMessageParser';

/**
 * Event fired when a chat review session is offered to a guide.
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/help/ChatReviewSessionOfferedToGuideMessageEvent.as
 */
export class ChatReviewSessionOfferedToGuideMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callBack: Function)
	{
		super(callBack, ChatReviewSessionOfferedToGuideMessageParser);
	}

	get parser(): ChatReviewSessionOfferedToGuideMessageParser
	{
		return this.getParser() as ChatReviewSessionOfferedToGuideMessageParser;
	}
}
