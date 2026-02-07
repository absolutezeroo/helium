import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Marks a guide session as resolved.
 *
 * @see source_as/habbo/communication/messages/outgoing/help/GuideSessionResolvedMessageComposer.as
 */
export class GuideSessionResolvedMessageComposer extends MessageComposer<[]>
{
	getMessageArray(): []
	{
		return [];
	}
}
