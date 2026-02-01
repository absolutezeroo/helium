import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';


/**
 * Sent when the navigator is initialized to request metadata
 *
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
