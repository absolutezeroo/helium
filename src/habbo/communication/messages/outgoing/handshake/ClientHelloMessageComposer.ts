import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * First message sent to server to initiate connection
 * Message ID: 4000
 *
 * @see source_as/habbo/communication/messages/outgoing/handshake/ClientHelloMessageComposer.as
 */
export class ClientHelloMessageComposer implements IMessageComposer<ConstructorParameters<typeof ClientHelloMessageComposer>>
{
	private _data: ConstructorParameters<typeof ClientHelloMessageComposer>;

	constructor(
		releaseVersion: string = 'WIN63-202407091256-704579380',
		type: string = 'FLASH20',
		platform: number = 6,
		category: number = 4
	)
	{
		this._data = [releaseVersion, type, platform, category];
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
