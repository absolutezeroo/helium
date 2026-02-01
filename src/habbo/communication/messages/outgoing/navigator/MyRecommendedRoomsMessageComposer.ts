import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Get my recommended rooms
 *
 * Based on AS3 MyRecommendedRoomsMessageComposer
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
