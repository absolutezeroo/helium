import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Search popular rooms
 *
 * @see source_as/habbo/communication/messages/outgoing/navigator/PopularRoomsSearchMessageComposer.as
 */
export class PopularRoomsSearchMessageComposer implements IMessageComposer<ConstructorParameters<typeof PopularRoomsSearchMessageComposer>>
{
	private _data: ConstructorParameters<typeof PopularRoomsSearchMessageComposer>;

	constructor(category: string, index: number)
	{
		this._data = [category, index];
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
