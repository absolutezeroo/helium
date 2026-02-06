import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Parser for trading completed message
 *
 * @see source_as/habbo/communication/messages/parser/inventory/trading/TradingCompletedEventParser.as
 */
export class TradingCompletedMessageParser implements IMessageParser
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
