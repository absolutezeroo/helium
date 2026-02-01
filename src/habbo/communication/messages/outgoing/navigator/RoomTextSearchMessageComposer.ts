import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Search rooms by text
 *
 * Based on AS3 RoomTextSearchMessageComposer
 */
export class RoomTextSearchMessageComposer implements IMessageComposer<ConstructorParameters<typeof RoomTextSearchMessageComposer>>
{
	private _data: ConstructorParameters<typeof RoomTextSearchMessageComposer>;

	constructor(searchText: string)
	{
		this._data = [searchText];
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
