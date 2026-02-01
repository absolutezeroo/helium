import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Send client version information
 * Message ID: 2602
 */
export class VersionCheckMessageComposer implements IMessageComposer<ConstructorParameters<typeof VersionCheckMessageComposer>>
{
	private _data: ConstructorParameters<typeof VersionCheckMessageComposer>;

	constructor(
		versionId: number = 0,
		clientUrl: string = '',
		externalVariablesUrl: string = ''
	)
	{
		this._data = [];

		this._data.push(versionId, clientUrl, externalVariablesUrl);
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
