import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Search rooms where I have rights
 *
 * Based on AS3 MyRoomRightsSearchMessageComposer
 */
export class MyRoomRightsSearchMessageComposer implements IMessageComposer<ConstructorParameters<typeof MyRoomRightsSearchMessageComposer>>
{
	private _data: ConstructorParameters<typeof MyRoomRightsSearchMessageComposer>;

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
