import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
	CompetitionVotingInfoMessageEventParser
} from '../../parser/competition/CompetitionVotingInfoMessageEventParser';

/**
 * Event for competition voting info message
 *
 * @see source_as/habbo/communication/messages/incoming/competition/CompetitionVotingInfoMessageEvent.as
 */
export class CompetitionVotingInfoMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, CompetitionVotingInfoMessageEventParser);
	}
}
