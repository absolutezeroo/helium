import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Search rooms where my friends are
 *
 * @see source_as/habbo/communication/messages/outgoing/navigator/RoomsWhereMyFriendsAreSearchMessageComposer.as
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
