import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {InClientLinkMessageParser} from '../../parser/users/InClientLinkMessageParser';

/**
 * Event for in-client link messages sent by the server
 *
 * The server sends a link string that should be routed to the appropriate
 * link event tracker via ComponentContext.createLinkEvent().
 *
 * @see source_as/habbo/communication/messages/incoming/users/InClientLinkMessageEvent.as
 */
export class InClientLinkMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, InClientLinkMessageParser);
	}

	get link(): string
	{
		return (this._parser as InClientLinkMessageParser).link;
	}
}
