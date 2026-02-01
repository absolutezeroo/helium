import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Remove a room from favourites
 *
 * @see source_as/habbo/communication/messages/outgoing/navigator/DeleteFavouriteRoomMessageComposer.as
 */
export class DeleteFavouriteRoomMessageComposer implements IMessageComposer<ConstructorParameters<typeof DeleteFavouriteRoomMessageComposer>>
{
	private _data: ConstructorParameters<typeof DeleteFavouriteRoomMessageComposer>;

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
