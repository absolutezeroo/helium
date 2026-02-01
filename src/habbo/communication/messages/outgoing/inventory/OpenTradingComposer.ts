import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Open trading with another user
 *
 * @see source_as/habbo/communication/messages/outgoing/inventory/trading/OpenTradingComposer.as
 */
export class OpenTradingComposer implements IMessageComposer<ConstructorParameters<typeof OpenTradingComposer>>
{
	private _data: ConstructorParameters<typeof OpenTradingComposer>;

	constructor(userId: number)
	{
		this._data = [userId];
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
