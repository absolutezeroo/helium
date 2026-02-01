import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Get my recommended rooms
 *
 * @see source_as/habbo/communication/messages/outgoing/navigator/MyRecommendedRoomsMessageComposer.as
 */
export class MyRecommendedRoomsMessageComposer implements IMessageComposer<ConstructorParameters<typeof MyRecommendedRoomsMessageComposer>>
{
	private _data: ConstructorParameters<typeof MyRecommendedRoomsMessageComposer>;

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
