import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for error report event
 *
 * @see source_as/habbo/communication/messages/parser/error/ErrorReportEventParser.as
 */
export class ErrorReportEventParser implements IMessageParser
{
	private _errorCode: number = 0;
	private _messageId: number = 0;
	private _timestamp: string = '';

	get errorCode(): number
	{
		return this._errorCode;
	}

	get messageId(): number
	{
		return this._messageId;
	}

	get timestamp(): string
	{
		return this._timestamp;
	}

	flush(): boolean
	{
		this._errorCode = 0;
		this._messageId = 0;
		this._timestamp = '';
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		this._messageId = wrapper.readInt();
		this._errorCode = wrapper.readInt();
		this._timestamp = wrapper.readString();
		return true;
	}
}
