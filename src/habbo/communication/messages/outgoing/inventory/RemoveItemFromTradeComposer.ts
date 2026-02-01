import type {IMessageComposer} from "@/core";

/**
 * Remove item from trade
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
