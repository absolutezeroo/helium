import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Adds a saved search to the navigator
 *
 * @see source_as/habbo/communication/messages/outgoing/newnavigator/NavigatorAddSavedSearchComposer.as
 */
export class NavigatorAddSavedSearchComposer implements IMessageComposer<ConstructorParameters<typeof NavigatorAddSavedSearchComposer>>
{
	private _data: ConstructorParameters<typeof NavigatorAddSavedSearchComposer>;

	constructor(searchCode: string, filtering: string)
	{
		this._data = [searchCode, filtering];
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
