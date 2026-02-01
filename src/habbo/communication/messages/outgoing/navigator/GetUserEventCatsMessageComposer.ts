import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Get user's event categories
 *
 * Based on AS3 GetUserEventCatsMessageComposer
 */
export class GetUserEventCatsMessageComposer implements IMessageComposer<ConstructorParameters<typeof GetUserEventCatsMessageComposer>>
{
	private _data: ConstructorParameters<typeof GetUserEventCatsMessageComposer>;

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
