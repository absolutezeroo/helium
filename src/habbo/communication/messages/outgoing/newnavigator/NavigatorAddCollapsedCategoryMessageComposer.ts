import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Adds a collapsed category to the navigator
 *
 * @see source_as/habbo/communication/messages/outgoing/newnavigator/NavigatorAddCollapsedCategoryMessageComposer.as
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
