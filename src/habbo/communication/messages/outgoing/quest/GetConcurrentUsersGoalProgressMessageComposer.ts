import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests the concurrent users goal progress from the server.
 *
 * @see source_as/habbo/communication/messages/outgoing/quest/GetConcurrentUsersGoalProgressMessageComposer.as
 */
export class GetConcurrentUsersGoalProgressMessageComposer extends MessageComposer<[]>
{
	getMessageArray(): []
	{
		return [];
	}
}
