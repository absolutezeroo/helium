import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests the room ID of the help requester.
 *
 * @see source_as/habbo/communication/messages/outgoing/help/GuideSessionGetRequesterRoomMessageComposer.as
 */
export class GuideSessionGetRequesterRoomMessageComposer extends MessageComposer<[]>
{
	getMessageArray(): []
	{
		return [];
	}
}
