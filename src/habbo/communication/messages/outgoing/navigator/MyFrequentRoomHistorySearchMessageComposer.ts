import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Search my frequent room history
 *
 * @see source_as/habbo/communication/messages/outgoing/navigator/MyFrequentRoomHistorySearchMessageComposer.as
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
