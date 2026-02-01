import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Room ad event tab ad clicked
 *
 * Based on AS3 RoomAdEventTabAdClickedComposer
 */
export class RoomAdEventTabAdClickedComposer implements IMessageComposer<ConstructorParameters<typeof RoomAdEventTabAdClickedComposer>>
{
	private _data: ConstructorParameters<typeof RoomAdEventTabAdClickedComposer>;

	constructor(roomId: number, adName: string, adId: number)
	{
		this._data = [roomId, adName, adId];
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
