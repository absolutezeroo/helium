import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';

/**
 * Decline trading after confirmation stage
 *
 * @see source_as/habbo/communication/messages/outgoing/inventory/trading/ConfirmDeclineTradingComposer.as
 */
export class ConfirmDeclineTradingComposer implements IMessageComposer<ConstructorParameters<typeof ConfirmDeclineTradingComposer>>
{
	private _data: ConstructorParameters<typeof ConfirmDeclineTradingComposer>;

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
