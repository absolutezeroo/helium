import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Request user info after authentication
 *
 * @see source_as/habbo/communication/messages/outgoing/handshake/InfoRetrieveMessageComposer.as
 */
export class InfoRetrieveMessageComposer implements IMessageComposer<ConstructorParameters<typeof InfoRetrieveMessageComposer>>
{
	private _data: ConstructorParameters<typeof InfoRetrieveMessageComposer>;

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
