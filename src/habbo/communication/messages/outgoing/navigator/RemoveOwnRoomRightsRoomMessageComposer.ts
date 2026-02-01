import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Remove own room rights
 *
 * @see source_as/habbo/communication/messages/outgoing/navigator/RemoveOwnRoomRightsRoomMessageComposer.as
 */
export class RemoveOwnRoomRightsRoomMessageComposer implements IMessageComposer<ConstructorParameters<typeof RemoveOwnRoomRightsRoomMessageComposer>>
{
	private _data: ConstructorParameters<typeof RemoveOwnRoomRightsRoomMessageComposer>;

	constructor(roomId: number)
	{
		this._data = [roomId];
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
