import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Opens a flat (room) connection to enter a room
 *
 * Based on AS3: com.sulake.habbo.communication.messages.outgoing.room.session.OpenFlatConnectionMessageComposer
 *
 * This message initiates the room entry sequence. After sending this,
 * the server will respond with room data messages (HeightMap, FloorHeightMap,
 * Objects, Users, etc.)
 */
export class OpenFlatConnectionMessageComposer extends MessageComposer<[number, string]>
{
	private _data: [number, string];

	constructor(roomId: number, password: string = '')
	{
		super();
		this._data = [roomId, password];
	}

	getMessageArray(): [number, string]
	{
		return this._data;
	}
}
