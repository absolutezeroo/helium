import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Search my guild bases
 *
 * @see source_as/habbo/communication/messages/outgoing/navigator/MyGuildBasesSearchMessageComposer.as
 */
export class MyGuildBasesSearchMessageComposer implements IMessageComposer<ConstructorParameters<typeof MyGuildBasesSearchMessageComposer>>
{
	private _data: ConstructorParameters<typeof MyGuildBasesSearchMessageComposer>;

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
