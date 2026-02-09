import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {IssueInfoMessageParser} from '../../parser/moderation/IssueInfoMessageParser';

/**
 * Event for a single issue info update.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/moderation/IssueInfoMessageEvent.as
 */
export class IssueInfoMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, IssueInfoMessageParser);
	}
}
