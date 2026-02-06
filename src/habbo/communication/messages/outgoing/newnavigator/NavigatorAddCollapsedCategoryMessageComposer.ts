import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Adds a collapsed category to the navigator
 *
 * @see source_as/habbo/communication/messages/outgoing/newnavigator/NavigatorAddCollapsedCategoryMessageComposer.as
 */
export class NavigatorAddCollapsedCategoryMessageComposer extends MessageComposer<ConstructorParameters<typeof NavigatorAddCollapsedCategoryMessageComposer>>
{
	private _data: ConstructorParameters<typeof NavigatorAddCollapsedCategoryMessageComposer>;

	constructor(category: string)
	{
		super();

		this._data = [category];
	}

	public getMessageArray()
	{
		return this._data;
	}

}
