import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Sets the view mode for a search code in the navigator
 *
 */
export class NavigatorSetSearchCodeViewModeMessageComposer implements IMessageComposer<ConstructorParameters<typeof NavigatorSetSearchCodeViewModeMessageComposer>>
{
	private _data: ConstructorParameters<typeof NavigatorSetSearchCodeViewModeMessageComposer>;

	constructor(searchCode: string, viewMode: number)
	{
		this._data = [searchCode, viewMode];
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
