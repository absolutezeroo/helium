import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Parser for trading confirmation message
 */
export class TradingConfirmationMessageParser implements IMessageParser
{
	flush(): boolean
	{
		return true;
	}

	parse(_wrapper: IMessageDataWrapper): boolean
	{
		return true;
	}
}
