import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Search room ads
 *
 * @see source_as/habbo/communication/messages/outgoing/navigator/RoomAdSearchMessageComposer.as
 */
export class RoomAdSearchMessageComposer implements IMessageComposer<ConstructorParameters<typeof RoomAdSearchMessageComposer>>
{
	private _data: ConstructorParameters<typeof RoomAdSearchMessageComposer>;

	constructor(categoryId: number, index: number)
	{
		this._data = [categoryId, index];
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
