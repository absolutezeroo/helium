import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Rate a flat/room
 *
 * @see source_as/habbo/communication/messages/outgoing/navigator/RateFlatMessageComposer.as
 */
export class RateFlatMessageComposer extends MessageComposer<ConstructorParameters<typeof RateFlatMessageComposer>>
{
	private _data: ConstructorParameters<typeof RateFlatMessageComposer>;

	constructor(rating: number)
	{
		super();

		this._data = [rating];
	}

	public getMessageArray()
	{
		return this._data;
	}

}
