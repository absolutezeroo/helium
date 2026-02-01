import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Search rooms with highest score
 *
 * Based on AS3 RoomsWithHighestScoreSearchMessageComposer
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
