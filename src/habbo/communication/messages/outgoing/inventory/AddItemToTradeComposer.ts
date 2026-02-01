import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Add item to trade
 *
 * @see source_as/habbo/communication/messages/outgoing/inventory/trading/AddItemToTradeComposer.as
 */
export class AddItemToTradeComposer implements IMessageComposer<ConstructorParameters<typeof AddItemToTradeComposer>>
{
	private _data: ConstructorParameters<typeof AddItemToTradeComposer>;

	constructor(itemId: number)
	{
		this._data = [itemId];
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
