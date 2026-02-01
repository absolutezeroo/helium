import type {IMessageComposer} from "@/core";

/**
 * Reset unseen items for a category
 */
export class ResetUnseenItemsComposer implements IMessageComposer<ConstructorParameters<typeof ResetUnseenItemsComposer>>
{
	private _data: ConstructorParameters<typeof ResetUnseenItemsComposer>;

	constructor(category: number, ...itemIds: number[])
	{
		this._data = [category, itemIds.length, ...itemIds];
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
