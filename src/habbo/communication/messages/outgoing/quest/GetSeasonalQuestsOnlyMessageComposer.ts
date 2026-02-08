import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests the list of seasonal quests only from the server.
 *
 * @see source_as/habbo/communication/messages/outgoing/quest/GetSeasonalQuestsOnlyMessageComposer.as
 */
export class GetSeasonalQuestsOnlyMessageComposer extends MessageComposer<[]>
{
	getMessageArray(): []
	{
		return [];
	}
}
