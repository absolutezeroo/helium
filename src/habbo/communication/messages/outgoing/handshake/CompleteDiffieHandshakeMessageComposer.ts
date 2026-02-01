import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Complete Diffie-Hellman key exchange with our public key
 * Message ID: 2616
 *
 * @see source_as/habbo/communication/messages/outgoing/handshake/CompleteDiffieHandshakeMessageComposer.as
 */
export class CompleteDiffieHandshakeMessageComposer implements IMessageComposer<ConstructorParameters<typeof CompleteDiffieHandshakeMessageComposer>>
{
	private _data: ConstructorParameters<typeof CompleteDiffieHandshakeMessageComposer>;

	constructor(publicKey: string)
	{
		this._data = [publicKey];
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
