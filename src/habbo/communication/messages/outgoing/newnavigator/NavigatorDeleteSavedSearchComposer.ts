import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Deletes a saved search from the navigator
 *
 * @see source_as/habbo/communication/messages/outgoing/newnavigator/NavigatorDeleteSavedSearchComposer.as
 */
export class NavigatorDeleteSavedSearchComposer implements IMessageComposer<ConstructorParameters<typeof NavigatorDeleteSavedSearchComposer>>
{
	private _data: ConstructorParameters<typeof NavigatorDeleteSavedSearchComposer>;

	constructor(searchId: number)
	{
		this._data = [searchId];
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
