import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for successful authentication response
 * Message ID: 2323
 *
 * @see source_as/habbo/communication/messages/parser/handshake/AuthenticationOKMessageEventParser.as
 */
export class AuthenticationOKMessageParser implements IMessageParser
{
	public flush(): boolean
	{
		return true;
	}

	public parse(_wrapper: IMessageDataWrapper): boolean
	{
		// This message indicates successful authentication
		return true;
	}
}
