import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Search competition rooms
 *
 * Based on AS3 CompetitionRoomsSearchMessageComposer
 */
export class CompetitionRoomsSearchMessageComposer implements IMessageComposer<ConstructorParameters<typeof CompetitionRoomsSearchMessageComposer>>
{
	private _data: ConstructorParameters<typeof CompetitionRoomsSearchMessageComposer>;

	constructor(goalId: number, pageIndex: number)
	{
		this._data = [goalId, pageIndex];
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
