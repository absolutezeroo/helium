import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {UserRightsMessageParser} from '../../parser/handshake/UserRightsMessageParser';

/**
 * Event handler for User rights message
 * Message ID: 1416
 *
 * @see source_as_win63/habbo/communication/messages/incoming/handshake/UserRightsMessageEvent.as
 */
export class UserRightsMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, UserRightsMessageParser);
	}
}
