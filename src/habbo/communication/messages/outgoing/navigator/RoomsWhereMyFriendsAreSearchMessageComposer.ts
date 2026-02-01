import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Search rooms where my friends are
 *
 * Based on AS3 RoomsWhereMyFriendsAreSearchMessageComposer
 */
export class RoomsWhereMyFriendsAreSearchMessageComposer implements IMessageComposer<ConstructorParameters<typeof RoomsWhereMyFriendsAreSearchMessageComposer>>
{
	private _data: ConstructorParameters<typeof RoomsWhereMyFriendsAreSearchMessageComposer>;

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
