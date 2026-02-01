import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Get guest room information
 *
 * @see source_as/habbo/communication/messages/outgoing/navigator/GetGuestRoomMessageComposer.as
 */
export class GetGuestRoomMessageComposer implements IMessageComposer<ConstructorParameters<typeof GetGuestRoomMessageComposer>>
{
	private _data: ConstructorParameters<typeof GetGuestRoomMessageComposer>;

	constructor(roomId: number, enterRoom: boolean, roomForward: boolean)
	{
		this._data = [roomId, enterRoom, roomForward];
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
