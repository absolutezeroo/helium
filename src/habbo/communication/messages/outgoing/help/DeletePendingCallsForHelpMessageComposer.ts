import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Deletes all pending calls for help.
 *
 * @see source_as/habbo/communication/messages/outgoing/help/DeletePendingCallsForHelpMessageComposer.as
 */
export class DeletePendingCallsForHelpMessageComposer extends MessageComposer<[]>
{
	getMessageArray(): []
	{
		return [];
	}
}
