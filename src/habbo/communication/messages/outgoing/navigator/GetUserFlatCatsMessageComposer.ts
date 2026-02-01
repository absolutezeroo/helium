import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Get user's flat categories
 *
 * @see source_as/habbo/communication/messages/outgoing/navigator/GetUserFlatCatsMessageComposer.as
 */
export class GetUserFlatCatsMessageComposer implements IMessageComposer<ConstructorParameters<typeof GetUserFlatCatsMessageComposer>>
{
	private _data: ConstructorParameters<typeof GetUserFlatCatsMessageComposer>;

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
