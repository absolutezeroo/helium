import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {EmailStatusResultParser} from '../../parser/users/EmailStatusResultParser';

/**
 * Event for email status result
 *
 * @see source_as_win63/habbo/communication/messages/incoming/users/EmailStatusResultEvent.as
 */
export class EmailStatusResultEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, EmailStatusResultParser);
	}
}
