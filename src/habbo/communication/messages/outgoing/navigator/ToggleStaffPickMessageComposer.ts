import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Toggle staff pick status
 *
 * @see source_as/habbo/communication/messages/outgoing/navigator/ToggleStaffPickMessageComposer.as
 */
export class ToggleStaffPickMessageComposer implements IMessageComposer<ConstructorParameters<typeof ToggleStaffPickMessageComposer>>
{
	private _data: ConstructorParameters<typeof ToggleStaffPickMessageComposer>;

	constructor(roomId: number, picked: boolean)
	{
		this._data = [roomId, picked];
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
