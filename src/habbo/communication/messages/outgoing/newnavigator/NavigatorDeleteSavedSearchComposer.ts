import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Deletes a saved search from the navigator
 *
 * @see source_as/habbo/communication/messages/outgoing/newnavigator/NavigatorDeleteSavedSearchComposer.as
 */
export class NavigatorDeleteSavedSearchComposer extends MessageComposer<ConstructorParameters<typeof NavigatorDeleteSavedSearchComposer>>
{
	private _data: ConstructorParameters<typeof NavigatorDeleteSavedSearchComposer>;

	constructor(searchId: number)
	{
		super();

		this._data = [searchId];
	}

	getMessageArray()
	{
		return this._data;
	}

}
