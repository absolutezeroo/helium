import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Rate a flat/room
 *
 * @see source_as/habbo/communication/messages/outgoing/navigator/RateFlatMessageComposer.as
 */
export class RateFlatMessageComposer implements IMessageComposer<ConstructorParameters<typeof RateFlatMessageComposer>>
{
	private _data: ConstructorParameters<typeof RateFlatMessageComposer>;

	constructor(rating: number)
	{
		this._data = [rating];
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
