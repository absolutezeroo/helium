import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Removes a collapsed category from the navigator
 *
 * @see source_as/habbo/communication/messages/outgoing/newnavigator/NavigatorRemoveCollapsedCategoryMessageComposer.as
 */
export class NavigatorRemoveCollapsedCategoryMessageComposer implements IMessageComposer<ConstructorParameters<typeof NavigatorRemoveCollapsedCategoryMessageComposer>>
{
	private _data: ConstructorParameters<typeof NavigatorRemoveCollapsedCategoryMessageComposer>;

	constructor(category: string)
	{
		this._data = [category];
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
