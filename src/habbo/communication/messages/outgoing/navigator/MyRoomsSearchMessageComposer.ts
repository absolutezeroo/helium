import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Search my own rooms
 *
 * @see source_as/habbo/communication/messages/outgoing/navigator/MyRoomsSearchMessageComposer.as
 */
export class MyRoomsSearchMessageComposer extends MessageComposer<ConstructorParameters<typeof MyRoomsSearchMessageComposer>>
{
	private _data: ConstructorParameters<typeof MyRoomsSearchMessageComposer>;

	constructor()
	{
		super();

		this._data = [];
	}

	getMessageArray()
	{
		return this._data;
	}

}
