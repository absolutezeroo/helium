import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for generic error messages
 * Message ID: 598
 *
 * @see source_as/habbo/communication/messages/parser/handshake/GenericErrorEventParser.as
 */
export class GenericErrorMessageParser implements IMessageParser
{
	private _errorCode: number = 0;

	get errorCode(): number
	{
		return this._errorCode;
	}

	public flush(): boolean
	{
		this._errorCode = 0;
		return true;
	}

	public parse(wrapper: IMessageDataWrapper): boolean
	{
		if (wrapper.bytesAvailable >= 4)
		{
			this._errorCode = wrapper.readInt();
		}
		return true;
	}
}
