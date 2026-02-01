import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Set which badges are worn/active
 *
 * @see source_as/habbo/communication/messages/outgoing/inventory/badges/SetActivatedBadgesComposer.as
 */
export class SetActivatedBadgesComposer implements IMessageComposer<unknown[]>
{
	private _data: unknown[];

	constructor(...badgeIds: string[])
	{
		// Build the data array in constructor: slot1, badge1, slot2, badge2, ...
		this._data = [];

		for (let i = 0; i < 5; i++)
		{
			this._data.push(i + 1); // slot number (1-5)
			this._data.push(badgeIds[i] ?? ''); // badge id or empty
		}
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
