import type {IMessageComposer} from "@/core";

/**
 * Add item to trade
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
