import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Search guild base
 *
 * @see source_as/habbo/communication/messages/outgoing/navigator/GuildBaseSearchMessageComposer.as
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
