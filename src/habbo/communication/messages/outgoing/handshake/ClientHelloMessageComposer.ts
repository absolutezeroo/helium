import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * First message sent to server to initiate connection
 * Message ID: 4000
 *
 * @see source_as/habbo/communication/messages/outgoing/handshake/ClientHelloMessageComposer.as
 */
export class ClientHelloMessageComposer extends MessageComposer<ConstructorParameters<typeof ClientHelloMessageComposer>>
{
	private _data: ConstructorParameters<typeof ClientHelloMessageComposer>;

	constructor(
		public releaseVersion: string = 'WIN63-202407091256-704579380',
		public type: string = 'FLASH20',
		public platform: number = 6,
		public category: number = 4
	)
	{
		super();

		this._data = [releaseVersion, type, platform, category];
	}

	public getMessageArray()
	{
		return this._data;
	}

}
