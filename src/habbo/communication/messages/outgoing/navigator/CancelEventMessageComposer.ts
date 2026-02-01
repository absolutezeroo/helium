import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Cancel a room event
 *
 * @see source_as/habbo/communication/messages/outgoing/navigator/CancelEventMessageComposer.as
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
