import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Remove item from trade
 *
 * @see source_as/habbo/communication/messages/outgoing/inventory/trading/RemoveItemFromTradeComposer.as
 */
export class RemoveItemFromTradeComposer implements IMessageComposer<ConstructorParameters<typeof RemoveItemFromTradeComposer>>
{
	private _data: ConstructorParameters<typeof RemoveItemFromTradeComposer>;

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
