import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Notifies the server that the quest tracker has been opened.
 *
 * @see source_as/habbo/communication/messages/outgoing/quest/OpenQuestTrackerMessageComposer.as
 */
export class OpenQuestTrackerMessageComposer extends MessageComposer<[]>
{
	getMessageArray(): []
	{
		return [];
	}
}
