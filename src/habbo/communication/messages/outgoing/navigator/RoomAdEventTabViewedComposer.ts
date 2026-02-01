import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Room ad event tab viewed
 *
 * Based on AS3 RoomAdEventTabViewedComposer
 */
export class RoomAdEventTabViewedComposer implements IMessageComposer<ConstructorParameters<typeof RoomAdEventTabViewedComposer>>
{
	private _data: ConstructorParameters<typeof RoomAdEventTabViewedComposer>;

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
