import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for doorbell message
 *
 * @see source_as/habbo/communication/messages/parser/navigator/DoorbellMessageEventParser.as
 */
export class DoorbellMessageParser implements IMessageParser
{
	private _userName: string = '';

	get userName(): string
	{
		return this._userName;
	}

	public flush(): boolean
	{
		this._userName = '';
		return true;
	}

	public parse(wrapper: IMessageDataWrapper): boolean
	{
		this._userName = wrapper.readString();
		return true;
	}
}
