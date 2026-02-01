import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Unaccept the current trade offer
 *
 * @see source_as/habbo/communication/messages/outgoing/inventory/trading/UnacceptTradingComposer.as
 */
export class UnacceptTradingComposer implements IMessageComposer<ConstructorParameters<typeof UnacceptTradingComposer>>
{
	private _data: ConstructorParameters<typeof UnacceptTradingComposer>;

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
