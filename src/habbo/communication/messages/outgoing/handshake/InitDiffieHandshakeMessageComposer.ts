import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Request to start Diffie-Hellman key exchange
 * Message ID: 586
 *
 * @see source_as/habbo/communication/messages/outgoing/handshake/InitDiffieHandshakeMessageComposer.as
 */
export class InitDiffieHandshakeMessageComposer implements IMessageComposer<ConstructorParameters<typeof InitDiffieHandshakeMessageComposer>>
{
	private _data: ConstructorParameters<typeof InitDiffieHandshakeMessageComposer>;

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
