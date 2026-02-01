import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Toggle staff pick status
 *
 * Based on AS3 ToggleStaffPickMessageComposer
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
