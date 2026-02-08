import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Cancels the currently active quest.
 *
 * @see source_as/habbo/communication/messages/outgoing/quest/CancelQuestMessageComposer.as
 */
export class CancelQuestMessageComposer extends MessageComposer<[]>
{
	getMessageArray(): []
	{
		return [];
	}
}
