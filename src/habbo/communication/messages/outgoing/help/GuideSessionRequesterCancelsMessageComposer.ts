import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Cancels a guide session from the requester side.
 *
 * @see source_as/habbo/communication/messages/outgoing/help/GuideSessionRequesterCancelsMessageComposer.as
 */
export class GuideSessionRequesterCancelsMessageComposer extends MessageComposer<[]>
{
	getMessageArray(): []
	{
		return [];
	}
}
