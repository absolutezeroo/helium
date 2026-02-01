import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';


/**
 * Sent when the navigator is initialized to request metadata
 *
 * @see source_as/habbo/communication/messages/outgoing/newnavigator/NewNavigatorInitComposer.as
 */
export class NewNavigatorInitComposer implements IMessageComposer<ConstructorParameters<typeof NewNavigatorInitComposer>>
{
	private _data: ConstructorParameters<typeof NewNavigatorInitComposer>;

	constructor()
	{
		this._data = [];
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
