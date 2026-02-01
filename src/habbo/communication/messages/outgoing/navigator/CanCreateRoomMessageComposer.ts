import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Check if user can create a room
 *
 * Based on AS3 CanCreateRoomMessageComposer
 */
export class CanCreateRoomMessageComposer implements IMessageComposer<ConstructorParameters<typeof CanCreateRoomMessageComposer>>
{
	private _data: ConstructorParameters<typeof CanCreateRoomMessageComposer>;

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
