import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Activates a quest by its ID.
 *
 * @see source_as/habbo/communication/messages/outgoing/quest/ActivateQuestMessageComposer.as
 */
export class ActivateQuestMessageComposer extends MessageComposer<ConstructorParameters<typeof ActivateQuestMessageComposer>>
{
	private _data: ConstructorParameters<typeof ActivateQuestMessageComposer>;

	constructor(questId: number)
	{
		super();
		this._data = [questId];
	}

	getMessageArray()
	{
		return this._data;
	}
}
