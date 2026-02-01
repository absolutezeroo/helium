import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Get user's event categories
 *
 * @see source_as/habbo/communication/messages/outgoing/navigator/GetUserEventCatsMessageComposer.as
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
