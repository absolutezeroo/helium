import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Search my favourite rooms
 *
 * Based on AS3 MyFavouriteRoomsSearchMessageComposer
 */
export class MyFavouriteRoomsSearchMessageComposer implements IMessageComposer<ConstructorParameters<typeof MyFavouriteRoomsSearchMessageComposer>>
{
	private _data: ConstructorParameters<typeof MyFavouriteRoomsSearchMessageComposer>;

	constructor()
	{
		this._data = [];
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
