import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Complete Diffie-Hellman key exchange with our public key
 * Message ID: 2616
 *
 * @see source_as/habbo/communication/messages/outgoing/handshake/CompleteDiffieHandshakeMessageComposer.as
 */
export class CompleteDiffieHandshakeMessageComposer extends MessageComposer<ConstructorParameters<typeof CompleteDiffieHandshakeMessageComposer>>
{
	private _data: ConstructorParameters<typeof CompleteDiffieHandshakeMessageComposer>;

	constructor(publicKey: string)
	{
		super();

		this._data = [publicKey];
	}

	getMessageArray()
	{
		return this._data;
	}

}
