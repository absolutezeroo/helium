import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Remove own room rights
 *
 * @see source_as/habbo/communication/messages/outgoing/navigator/RemoveOwnRoomRightsRoomMessageComposer.as
 */
export class RemoveOwnRoomRightsRoomMessageComposer extends MessageComposer<ConstructorParameters<typeof RemoveOwnRoomRightsRoomMessageComposer>>
{
	private _data: ConstructorParameters<typeof RemoveOwnRoomRightsRoomMessageComposer>;

	constructor(roomId: number)
	{
		super();

		this._data = [roomId];
	}

	public getMessageArray()
	{
		return this._data;
	}

}
