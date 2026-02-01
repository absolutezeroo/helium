import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Search guild base
 *
 * Based on AS3 GuildBaseSearchMessageComposer
 */
export class GuildBaseSearchMessageComposer implements IMessageComposer<ConstructorParameters<typeof GuildBaseSearchMessageComposer>>
{
	private _data: ConstructorParameters<typeof GuildBaseSearchMessageComposer>;

	constructor(guildId: number)
	{
		this._data = [guildId];
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
