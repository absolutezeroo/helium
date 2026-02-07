import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {RestoreClientMessageEventParser} from '../../parser/notifications/RestoreClientMessageEventParser';

/**
 * Event for restore client message
 *
 * @see source_as/habbo/communication/messages/incoming/notifications/RestoreClientMessageEvent.as
 */
export class RestoreClientMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, RestoreClientMessageEventParser);
	}
}
