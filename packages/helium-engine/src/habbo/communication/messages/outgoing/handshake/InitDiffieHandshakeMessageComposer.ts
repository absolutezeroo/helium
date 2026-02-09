import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Request to start Diffie-Hellman key exchange
 * Message ID: 586
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/handshake/InitDiffieHandshakeMessageComposer.as
 */
export class InitDiffieHandshakeMessageComposer extends MessageComposer<ConstructorParameters<typeof InitDiffieHandshakeMessageComposer>>
{
	private _data: ConstructorParameters<typeof InitDiffieHandshakeMessageComposer>;

	constructor()
	{
		super();

		this._data = [];
	}

	getMessageArray()
	{
		return this._data;
	}

}
