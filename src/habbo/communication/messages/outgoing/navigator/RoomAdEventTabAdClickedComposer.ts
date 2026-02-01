import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Room ad event tab ad clicked
 *
 * @see source_as/habbo/communication/messages/outgoing/navigator/RoomAdEventTabAdClickedComposer.as
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
