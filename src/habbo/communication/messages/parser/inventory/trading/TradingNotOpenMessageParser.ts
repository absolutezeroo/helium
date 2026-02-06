import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Parser for trading not open message
 *
 * @see source_as/habbo/communication/messages/parser/inventory/trading/TradingNotOpenEvent.as
 */
export class TradingNotOpenMessageParser implements IMessageParser
{
	public flush(): boolean
	{
		return true;
	}

	public parse(_wrapper: IMessageDataWrapper): boolean
	{
		return true;
	}
}
