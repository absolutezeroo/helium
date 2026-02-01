import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for doorbell message
 *
 * Based on AS3 DoorbellMessageEventParser
 */
export class DoorbellMessageParser implements IMessageParser
{
	private _userName: string = '';

	get userName(): string
	{
		return this._userName;
	}

	flush(): boolean
	{
		this._userName = '';
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		this._userName = wrapper.readString();
		return true;
	}
}
