import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Update home room
 *
 * Based on AS3 UpdateHomeRoomMessageComposer
 */
export class UpdateHomeRoomMessageComposer implements IMessageComposer<ConstructorParameters<typeof UpdateHomeRoomMessageComposer>>
{
	private _data: ConstructorParameters<typeof UpdateHomeRoomMessageComposer>;

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
