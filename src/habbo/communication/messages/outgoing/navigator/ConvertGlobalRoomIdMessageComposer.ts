import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Convert global room ID
 *
 * Based on AS3 ConvertGlobalRoomIdMessageComposer
 */
export class ConvertGlobalRoomIdMessageComposer implements IMessageComposer<ConstructorParameters<typeof ConvertGlobalRoomIdMessageComposer>>
{
	private _data: ConstructorParameters<typeof ConvertGlobalRoomIdMessageComposer>;

	constructor(flatId: string)
	{
		this._data = [flatId];
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
