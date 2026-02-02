import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Get guest room information
 *
 * @see source_as/habbo/communication/messages/outgoing/navigator/GetGuestRoomMessageComposer.as
 */
export class GetGuestRoomMessageComposer extends MessageComposer<ConstructorParameters<typeof GetGuestRoomMessageComposer>>
{
	private _data: ConstructorParameters<typeof GetGuestRoomMessageComposer>;

	constructor(roomId: number, enterRoom: boolean, roomForward: boolean)
	{
		super();

		this._data = [roomId, enterRoom, roomForward];
	}

	getMessageArray()
	{
		return this._data;
	}

}
