import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Request bot inventory from server
 *
 * @see source_as/habbo/communication/messages/outgoing/inventory/bots/GetBotInventoryComposer.as
 */
export class GetBotInventoryComposer implements IMessageComposer<ConstructorParameters<typeof GetBotInventoryComposer>>
{
	private _data: ConstructorParameters<typeof GetBotInventoryComposer>;

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
