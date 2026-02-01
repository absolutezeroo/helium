import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Search my friends' rooms
 *
 * @see source_as/habbo/communication/messages/outgoing/navigator/MyFriendsRoomsSearchMessageComposer.as
 */
export class MyFriendsRoomsSearchMessageComposer implements IMessageComposer<ConstructorParameters<typeof MyFriendsRoomsSearchMessageComposer>>
{
	private _data: ConstructorParameters<typeof MyFriendsRoomsSearchMessageComposer>;

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
