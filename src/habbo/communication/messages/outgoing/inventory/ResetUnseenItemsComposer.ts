import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Reset unseen items for a category
 *
 * @see source_as/habbo/communication/messages/outgoing/notifications/ResetUnseenItemsComposer.as
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
