import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Response to server ping (keep-alive)
 */
export class PongMessageComposer implements IMessageComposer<ConstructorParameters<typeof PongMessageComposer>>
{
	private _data: ConstructorParameters<typeof PongMessageComposer>;

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
