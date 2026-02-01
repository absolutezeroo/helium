import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for Ping message (keep-alive)
 * Message ID: 658
 */
export class PingMessageParser implements IMessageParser
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
