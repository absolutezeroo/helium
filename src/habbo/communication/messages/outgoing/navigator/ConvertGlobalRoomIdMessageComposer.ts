import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Convert global room ID
 *
 * @see source_as/habbo/communication/messages/outgoing/navigator/ConvertGlobalRoomIdMessageComposer.as
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
