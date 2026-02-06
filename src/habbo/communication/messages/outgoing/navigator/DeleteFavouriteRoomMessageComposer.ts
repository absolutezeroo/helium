import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Remove a room from favourites
 *
 * @see source_as/habbo/communication/messages/outgoing/navigator/DeleteFavouriteRoomMessageComposer.as
 */
export class DeleteFavouriteRoomMessageComposer extends MessageComposer<ConstructorParameters<typeof DeleteFavouriteRoomMessageComposer>>
{
	private _data: ConstructorParameters<typeof DeleteFavouriteRoomMessageComposer>;

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
