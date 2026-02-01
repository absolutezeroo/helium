import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Search competition rooms
 *
 * @see source_as/habbo/communication/messages/outgoing/navigator/CompetitionRoomsSearchMessageComposer.as
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
