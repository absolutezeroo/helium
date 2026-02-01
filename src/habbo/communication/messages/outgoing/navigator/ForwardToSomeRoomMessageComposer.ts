import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Forward to some room
 *
 * Based on AS3 ForwardToSomeRoomMessageComposer
 */
export class ForwardToSomeRoomMessageComposer implements IMessageComposer<ConstructorParameters<typeof ForwardToSomeRoomMessageComposer>>
{
	private _data: ConstructorParameters<typeof ForwardToSomeRoomMessageComposer>;

	constructor(roomType: string)
	{
		this._data = [roomType];
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
