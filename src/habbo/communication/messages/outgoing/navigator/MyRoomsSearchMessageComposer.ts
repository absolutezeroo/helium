import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Search my own rooms
 *
 * @see source_as/habbo/communication/messages/outgoing/navigator/MyRoomsSearchMessageComposer.as
 */
export class MyRoomsSearchMessageComposer implements IMessageComposer<ConstructorParameters<typeof MyRoomsSearchMessageComposer>>
{
	private _data: ConstructorParameters<typeof MyRoomsSearchMessageComposer>;

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
