import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Cancel a room event
 *
 * Based on AS3 CancelEventMessageComposer
 */
export class CancelEventMessageComposer implements IMessageComposer<ConstructorParameters<typeof CancelEventMessageComposer>>
{
	private _data: ConstructorParameters<typeof CancelEventMessageComposer>;

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
