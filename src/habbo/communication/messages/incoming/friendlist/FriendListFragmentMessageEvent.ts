import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {FriendListFragmentMessageParser} from '../../parser/friendlist/FriendListFragmentMessageParser';

/**
 * Event for receiving a fragment of the friend list.
 * The server sends the full friend list in multiple fragments.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/friendlist/FriendListFragmentMessageEvent.as
 */
export class FriendListFragmentMessageEvent extends MessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, FriendListFragmentMessageParser);
	}
}
