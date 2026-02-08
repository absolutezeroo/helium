import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * First message sent to server to initiate connection
 * Message ID: 4000
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/handshake/ClientHelloMessageComposer.as
 */
export class ClientHelloMessageComposer extends MessageComposer<ConstructorParameters<typeof ClientHelloMessageComposer>>
{
	private _data: ConstructorParameters<typeof ClientHelloMessageComposer>;

	constructor(
		releaseVersion: string = 'WIN63-202407091256-704579380',
		type: string = 'FLASH20',
		platform: number = 6,
		category: number = 4
	)
	{
		super();

		this._data = [releaseVersion, type, platform, category];
	}

	getMessageArray()
	{
		return this._data;
	}

}
