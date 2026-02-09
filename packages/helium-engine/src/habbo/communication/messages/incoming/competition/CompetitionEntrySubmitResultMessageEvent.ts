import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
	CompetitionEntrySubmitResultMessageEventParser
} from '../../parser/competition/CompetitionEntrySubmitResultMessageEventParser';

/**
 * Event for competition entry submit result message
 *
 * @see source_as_win63/habbo/communication/messages/incoming/competition/CompetitionEntrySubmitResultMessageEvent.as
 */
export class CompetitionEntrySubmitResultMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, CompetitionEntrySubmitResultMessageEventParser);
	}
}
