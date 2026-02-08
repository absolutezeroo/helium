import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {UserEventCatsMessageParser} from '../../parser/navigator/UserEventCatsMessageParser';

/**
 * Event handler for UserEventCats message
 *
 * @see source_as_win63/habbo/communication/messages/incoming/navigator/UserEventCatsEvent.as
 */
export class UserEventCatsMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, UserEventCatsMessageParser);
	}
}
