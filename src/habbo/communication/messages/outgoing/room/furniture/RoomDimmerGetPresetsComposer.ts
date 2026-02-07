import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Request the current dimmer presets for the room
 *
 * @see source_as/habbo/communication/messages/outgoing/room/furniture/RoomDimmerGetPresetsMessageComposer.as
 */
export class RoomDimmerGetPresetsComposer extends MessageComposer
{
	getMessageArray()
	{
		return [];
	}
}
