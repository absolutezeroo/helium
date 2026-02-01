import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Confirm accept trading (final confirmation)
 *
 * @see source_as/habbo/communication/messages/outgoing/inventory/trading/ConfirmAcceptTradingComposer.as
 */
export class ConfirmAcceptTradingComposer implements IMessageComposer<ConstructorParameters<typeof ConfirmAcceptTradingComposer>>
{
	private _data: ConstructorParameters<typeof ConfirmAcceptTradingComposer>;

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
