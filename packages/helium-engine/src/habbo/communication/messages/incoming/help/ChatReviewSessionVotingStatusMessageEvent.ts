import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {ChatReviewSessionVotingStatusMessageParser} from '../../parser/help/ChatReviewSessionVotingStatusMessageParser';

/**
 * Event fired when chat review session voting status is received.
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/help/ChatReviewSessionVotingStatusMessageEvent.as
 */
export class ChatReviewSessionVotingStatusMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callBack: Function)
	{
		super(callBack, ChatReviewSessionVotingStatusMessageParser);
	}

	get parser(): ChatReviewSessionVotingStatusMessageParser
	{
		return this.getParser() as ChatReviewSessionVotingStatusMessageParser;
	}
}
