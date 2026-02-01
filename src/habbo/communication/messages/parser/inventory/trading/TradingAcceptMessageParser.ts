import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Parser for trading accept message
 */
export class TradingAcceptMessageParser implements IMessageParser
{
	private _userId: number = 0;
	private _accepted: boolean = false;

	get userId(): number
	{
		return this._userId;
	}

	get accepted(): boolean
	{
		return this._accepted;
	}

	flush(): boolean
	{
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		this._userId = wrapper.readInt();
		this._accepted = wrapper.readInt() === 1;

		return true;
	}
}
