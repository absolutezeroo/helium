import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Search rooms with highest score
 *
 * @see source_as/habbo/communication/messages/outgoing/navigator/RoomsWithHighestScoreSearchMessageComposer.as
 */
export class RoomsWithHighestScoreSearchMessageComposer implements IMessageComposer<ConstructorParameters<typeof RoomsWithHighestScoreSearchMessageComposer>>
{
	private _data: ConstructorParameters<typeof RoomsWithHighestScoreSearchMessageComposer>;

	constructor(categoryId: number)
	{
		this._data = [categoryId];
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
