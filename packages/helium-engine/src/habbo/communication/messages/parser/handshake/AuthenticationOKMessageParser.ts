import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for successful authentication response
 * Message ID: 2323
 *
 * @see source_as_win63/habbo/communication/messages/parser/handshake/AuthenticationOKMessageEventParser.as
 */
export class AuthenticationOKMessageParser implements IMessageParser
{
	flush(): boolean
	{
		return true;
	}

	parse(_wrapper: IMessageDataWrapper): boolean
	{
		// This message indicates successful authentication
		return true;
	}
}
