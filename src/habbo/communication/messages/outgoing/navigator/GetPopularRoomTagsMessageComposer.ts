import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Get popular room tags
 *
 * @see source_as/habbo/communication/messages/outgoing/navigator/GetPopularRoomTagsMessageComposer.as
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
