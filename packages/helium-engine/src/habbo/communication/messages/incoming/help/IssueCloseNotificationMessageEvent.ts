import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {IssueCloseNotificationMessageParser} from '../../parser/help/IssueCloseNotificationMessageParser';

/**
 * Event fired when an issue is closed.
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/help/IssueCloseNotificationMessageEvent.as
 */
export class IssueCloseNotificationMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callBack: Function)
	{
		super(callBack, IssueCloseNotificationMessageParser);
	}

	get parser(): IssueCloseNotificationMessageParser
	{
		return this.getParser() as IssueCloseNotificationMessageParser;
	}
}
