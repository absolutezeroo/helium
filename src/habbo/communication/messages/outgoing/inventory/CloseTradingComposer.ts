import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Close trading session
 *
 * @see source_as/habbo/communication/messages/outgoing/inventory/trading/CloseTradingComposer.as
 */
export class CloseTradingComposer implements IMessageComposer<ConstructorParameters<typeof CloseTradingComposer>>
{
	private _data: ConstructorParameters<typeof CloseTradingComposer>;

	constructor()
	{
		this._data = [];
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
