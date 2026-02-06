import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Unaccept the current trade offer
 *
 * @see source_as/habbo/communication/messages/outgoing/inventory/trading/UnacceptTradingComposer.as
 */
export class UnacceptTradingComposer extends MessageComposer<ConstructorParameters<typeof UnacceptTradingComposer>>
{
	private _data: ConstructorParameters<typeof UnacceptTradingComposer>;

	constructor()
	{
		super();

		this._data = [];
	}

	public getMessageArray()
	{
		return this._data;
	}

}
