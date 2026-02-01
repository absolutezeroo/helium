import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Get guest room information
 *
 * Based on AS3 GetGuestRoomMessageComposer
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
