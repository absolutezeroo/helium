import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Forward to some room
 *
 * @see source_as/habbo/communication/messages/outgoing/navigator/ForwardToSomeRoomMessageComposer.as
 */
export class ForwardToSomeRoomMessageComposer implements IMessageComposer<ConstructorParameters<typeof ForwardToSomeRoomMessageComposer>>
{
	private _data: ConstructorParameters<typeof ForwardToSomeRoomMessageComposer>;

	constructor(roomType: string)
	{
		this._data = [roomType];
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
