import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests the current guide reporting status.
 *
 * @see source_as/habbo/communication/messages/outgoing/help/GetGuideReportingStatusMessageComposer.as
 */
export class GetGuideReportingStatusMessageComposer extends MessageComposer<[]>
{
	getMessageArray(): []
	{
		return [];
	}
}
