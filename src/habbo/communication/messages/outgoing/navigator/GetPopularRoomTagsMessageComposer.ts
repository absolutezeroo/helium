import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Get popular room tags
 *
 * Based on AS3 GetPopularRoomTagsMessageComposer
 */
export class GetPopularRoomTagsMessageComposer implements IMessageComposer<ConstructorParameters<typeof GetPopularRoomTagsMessageComposer>>
{
	private _data: ConstructorParameters<typeof GetPopularRoomTagsMessageComposer>;

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
