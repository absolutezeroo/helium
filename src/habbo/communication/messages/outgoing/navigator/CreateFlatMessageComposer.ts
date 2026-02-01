import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Create a new flat/room
 *
 * @see source_as/habbo/communication/messages/outgoing/navigator/CreateFlatMessageComposer.as
 */
export class CreateFlatMessageComposer implements IMessageComposer<ConstructorParameters<typeof CreateFlatMessageComposer>>
{
	private _data: ConstructorParameters<typeof CreateFlatMessageComposer>;

	constructor(
		roomName: string,
		roomDescription: string,
		roomModel: string,
		categoryId: number,
		maxUsers: number,
		tradeMode: number
	)
	{
		this._data = [roomName, roomDescription, roomModel, categoryId, maxUsers, tradeMode];
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
