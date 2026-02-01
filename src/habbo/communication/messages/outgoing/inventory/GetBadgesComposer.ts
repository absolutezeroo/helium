import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Request badges from server
 *
 * @see source_as/habbo/communication/messages/outgoing/inventory/badges/GetBadgesComposer.as
 */
export class GetBadgesComposer implements IMessageComposer<ConstructorParameters<typeof GetBadgesComposer>>
{
	private _data: ConstructorParameters<typeof GetBadgesComposer>;

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
