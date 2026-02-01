import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Performs a search in the new navigator
 *
 * @see source_as/habbo/communication/messages/outgoing/newnavigator/NewNavigatorSearchComposer.as
 */
export class NewNavigatorSearchComposer implements IMessageComposer<ConstructorParameters<typeof NewNavigatorSearchComposer>>
{
	private _data: ConstructorParameters<typeof NewNavigatorSearchComposer>;

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
