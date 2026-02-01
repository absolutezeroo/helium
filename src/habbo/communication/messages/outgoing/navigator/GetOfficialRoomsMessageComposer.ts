import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Get official rooms list
 *
 * @see source_as/habbo/communication/messages/outgoing/navigator/GetOfficialRoomsMessageComposer.as
 */
export class GetOfficialRoomsMessageComposer implements IMessageComposer<ConstructorParameters<typeof GetOfficialRoomsMessageComposer>>
{
	private _data: ConstructorParameters<typeof GetOfficialRoomsMessageComposer>;

	constructor(index: number = 0)
	{
		this._data = [index];
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
