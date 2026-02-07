import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {FindFriendsProcessResultMessageParser} from '../../parser/friendlist/FindFriendsProcessResultMessageParser';

/**
 * Event for receiving the result of a find new friends request.
 *
 * @see source_as/habbo/communication/messages/incoming/friendlist/FindFriendsProcessResultEvent.as
 */
export class FindFriendsProcessResultMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, FindFriendsProcessResultMessageParser);
	}
}
