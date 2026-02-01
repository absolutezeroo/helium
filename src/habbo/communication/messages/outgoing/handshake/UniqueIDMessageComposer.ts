import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Send unique machine/device identification
 * Message ID: 1390
 */
export class UniqueIDMessageComposer implements IMessageComposer<ConstructorParameters<typeof UniqueIDMessageComposer>>
{
	private _data: ConstructorParameters<typeof UniqueIDMessageComposer>;

	constructor(
		machineId: string = '',
		fingerprint: string = '',
		flashVersion: string = ''
	)
	{
		this._data = [];

		this._data.push(machineId, fingerprint, flashVersion);
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
