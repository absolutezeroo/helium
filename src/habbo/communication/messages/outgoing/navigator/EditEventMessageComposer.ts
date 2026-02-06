import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Edit a room event
 *
 * @see source_as/habbo/communication/messages/outgoing/navigator/EditEventMessageComposer.as
 */
export class EditEventMessageComposer extends MessageComposer<ConstructorParameters<typeof EditEventMessageComposer>>
{
	private _data: ConstructorParameters<typeof EditEventMessageComposer>;

	constructor(categoryId: number, eventName: string, eventDescription: string)
	{
		super();

		this._data = [categoryId, eventName, eventDescription];
	}

	public getMessageArray()
	{
		return this._data;
	}

}
