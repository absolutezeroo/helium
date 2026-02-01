import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Search my guild bases
 *
 * Based on AS3 MyGuildBasesSearchMessageComposer
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
