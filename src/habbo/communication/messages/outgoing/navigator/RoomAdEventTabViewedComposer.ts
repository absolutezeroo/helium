import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Room ad event tab viewed
 *
 * @see source_as/habbo/communication/messages/outgoing/navigator/RoomAdEventTabViewedComposer.as
 */
export class RoomAdEventTabViewedComposer implements IMessageComposer<ConstructorParameters<typeof RoomAdEventTabViewedComposer>>
{
	private _data: ConstructorParameters<typeof RoomAdEventTabViewedComposer>;

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
