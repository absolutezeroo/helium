import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Search my frequent room history
 *
 * Based on AS3 MyFrequentRoomHistorySearchMessageComposer
 */
export class MyFrequentRoomHistorySearchMessageComposer implements IMessageComposer<ConstructorParameters<typeof MyFrequentRoomHistorySearchMessageComposer>>
{
	private _data: ConstructorParameters<typeof MyFrequentRoomHistorySearchMessageComposer>;

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
