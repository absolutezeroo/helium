import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Adds a collapsed category to the navigator
 *
 */
export class NavigatorAddCollapsedCategoryMessageComposer implements IMessageComposer<ConstructorParameters<typeof NavigatorAddCollapsedCategoryMessageComposer>>
{
	private _data: ConstructorParameters<typeof NavigatorAddCollapsedCategoryMessageComposer>;

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
