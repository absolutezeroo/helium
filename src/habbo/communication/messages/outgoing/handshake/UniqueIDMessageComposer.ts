import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Send unique machine/device identification
 * Message ID: 1390
 *
 * @see source_as/habbo/communication/messages/outgoing/handshake/UniqueIDMessageComposer.as
 */
export class UniqueIDMessageComposer extends MessageComposer<ConstructorParameters<typeof UniqueIDMessageComposer>>
{
	private _data: ConstructorParameters<typeof UniqueIDMessageComposer>;

	constructor(
		public machineId: string = '',
		public fingerprint: string = '',
		public flashVersion: string = ''
	)
	{
		super();

		this._data = [machineId, fingerprint, flashVersion];
	}

	public getMessageArray()
	{
		return this._data;
	}

}
