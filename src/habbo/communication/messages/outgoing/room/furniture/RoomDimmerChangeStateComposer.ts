import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Toggle the dimmer on/off state
 *
 * @see source_as/habbo/communication/messages/outgoing/room/furniture/RoomDimmerChangeStateMessageComposer.as
 */
export class RoomDimmerChangeStateComposer extends MessageComposer
{
	getMessageArray()
	{
		return [];
	}
}
