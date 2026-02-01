import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Edit a room event
 *
 * Based on AS3 EditEventMessageComposer
 */
export class EditEventMessageComposer implements IMessageComposer<ConstructorParameters<typeof EditEventMessageComposer>>
{
	private _data: ConstructorParameters<typeof EditEventMessageComposer>;

	constructor(categoryId: number, eventName: string, eventDescription: string)
	{
		this._data = [categoryId, eventName, eventDescription];
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
