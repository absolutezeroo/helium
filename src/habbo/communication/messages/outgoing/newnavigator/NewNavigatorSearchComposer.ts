import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Performs a search in the new navigator
 *
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
