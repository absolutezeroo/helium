import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Send client version information
 * Message ID: 2602
 *
 * @see source_as/habbo/communication/messages/outgoing/handshake/VersionCheckMessageComposer.as
 */
export class VersionCheckMessageComposer extends MessageComposer<ConstructorParameters<typeof VersionCheckMessageComposer>>
{
	private _data: ConstructorParameters<typeof VersionCheckMessageComposer>;

	constructor(
		public versionId: number = 0,
		public clientUrl: string = '',
		public externalVariablesUrl: string = ''
	)
	{
		super();

		this._data = [versionId, clientUrl, externalVariablesUrl];
	}

	public getMessageArray()
	{
		return this._data;
	}

}
