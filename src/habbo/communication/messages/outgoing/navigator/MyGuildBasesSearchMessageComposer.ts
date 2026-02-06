import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Search my guild bases
 *
 * @see source_as/habbo/communication/messages/outgoing/navigator/MyGuildBasesSearchMessageComposer.as
 */
export class MyGuildBasesSearchMessageComposer extends MessageComposer<ConstructorParameters<typeof MyGuildBasesSearchMessageComposer>>
{
	private _data: ConstructorParameters<typeof MyGuildBasesSearchMessageComposer>;

	constructor()
	{
		super();

		this._data = [];
	}

	public getMessageArray()
	{
		return this._data;
	}

}
