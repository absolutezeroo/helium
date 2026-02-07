import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests to find new friends (random room matching).
 *
 * @see source_as/habbo/communication/messages/outgoing/friendlist/FindNewFriendsMessageComposer.as
 */
export class FindNewFriendsMessageComposer extends MessageComposer<[]>
{
	getMessageArray(): []
	{
		return [];
	}
}
