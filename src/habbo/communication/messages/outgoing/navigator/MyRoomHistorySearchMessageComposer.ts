import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Search my room history
 *
 * Based on AS3 MyRoomHistorySearchMessageComposer
 */
export class MyRoomHistorySearchMessageComposer implements IMessageComposer<ConstructorParameters<typeof MyRoomHistorySearchMessageComposer>>
{
	private _data: ConstructorParameters<typeof MyRoomHistorySearchMessageComposer>;

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
