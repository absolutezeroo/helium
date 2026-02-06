import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Convert global room ID
 *
 * @see source_as/habbo/communication/messages/outgoing/navigator/ConvertGlobalRoomIdMessageComposer.as
 */
export class ConvertGlobalRoomIdMessageComposer extends MessageComposer<ConstructorParameters<typeof ConvertGlobalRoomIdMessageComposer>>
{
	private _data: ConstructorParameters<typeof ConvertGlobalRoomIdMessageComposer>;

	constructor(flatId: string)
	{
		super();

		this._data = [flatId];
	}

	public getMessageArray()
	{
		return this._data;
	}

}
