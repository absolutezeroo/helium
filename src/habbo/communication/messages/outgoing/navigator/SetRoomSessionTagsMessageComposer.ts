import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Set room session tags
 *
 * @see source_as/habbo/communication/messages/outgoing/navigator/SetRoomSessionTagsMessageComposer.as
 */
export class SetRoomSessionTagsMessageComposer implements IMessageComposer<ConstructorParameters<typeof SetRoomSessionTagsMessageComposer>>
{
	private _data: ConstructorParameters<typeof SetRoomSessionTagsMessageComposer>;

	constructor(tag1: string, tag2: string)
	{
		this._data = [tag1, tag2];
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
