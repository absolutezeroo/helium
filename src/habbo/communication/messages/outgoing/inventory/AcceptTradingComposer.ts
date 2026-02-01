import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Accept the current trade offer
 *
 * @see source_as/habbo/communication/messages/outgoing/inventory/trading/AcceptTradingComposer.as
 */
export class AcceptTradingComposer implements IMessageComposer<ConstructorParameters<typeof AcceptTradingComposer>>
{
	private _data: ConstructorParameters<typeof AcceptTradingComposer>;

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
