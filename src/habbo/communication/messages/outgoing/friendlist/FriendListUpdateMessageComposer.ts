import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests a friend list update from the server.
 *
 * @see source_as/habbo/communication/messages/outgoing/friendlist/FriendListUpdateMessageComposer.as
 */
export class FriendListUpdateMessageComposer extends MessageComposer<[]>
{
	getMessageArray(): []
	{
		return [];
	}
}
