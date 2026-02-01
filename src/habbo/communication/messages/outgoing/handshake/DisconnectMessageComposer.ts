import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Request to disconnect from server
 * Message ID: 1113
 *
 * @see source_as/habbo/communication/messages/outgoing/handshake/DisconnectMessageComposer.as
 */
export class DisconnectMessageComposer implements IMessageComposer<ConstructorParameters<typeof DisconnectMessageComposer>>
{
	private _data: ConstructorParameters<typeof DisconnectMessageComposer>;

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
