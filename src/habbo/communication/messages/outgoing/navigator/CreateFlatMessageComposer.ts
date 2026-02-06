import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Create a new flat/room
 *
 * @see source_as/habbo/communication/messages/outgoing/navigator/CreateFlatMessageComposer.as
 */
export class CreateFlatMessageComposer extends MessageComposer<ConstructorParameters<typeof CreateFlatMessageComposer>>
{
	private _data: ConstructorParameters<typeof CreateFlatMessageComposer>;

	constructor(
		public roomName: string,
		public roomDescription: string,
		public roomModel: string,
		public categoryId: number,
		public maxUsers: number,
		public tradeMode: number
	)
	{
		super();

		this._data = [roomName, roomDescription, roomModel, categoryId, maxUsers, tradeMode];
	}

	public getMessageArray()
	{
		return this._data;
	}

}
