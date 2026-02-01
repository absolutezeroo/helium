import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Add a room to favourites
 *
 * @see source_as/habbo/communication/messages/outgoing/navigator/AddFavouriteRoomMessageComposer.as
 */
export class AddFavouriteRoomMessageComposer implements IMessageComposer<ConstructorParameters<typeof AddFavouriteRoomMessageComposer>>
{
	private _data: ConstructorParameters<typeof AddFavouriteRoomMessageComposer>;

	constructor(roomId: number)
	{
		this._data = [roomId];
	}

	getMessageArray()
	{
		return this._data;
	}

	dispose(): void
	{
		return;
	}
}
