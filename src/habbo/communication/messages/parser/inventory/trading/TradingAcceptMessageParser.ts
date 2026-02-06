import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Parser for trading accept message
 *
 * @see source_as/habbo/communication/messages/parser/inventory/trading/TradingAcceptEventParser.as
 */
export class TradingAcceptMessageParser implements IMessageParser
{
	private _userId: number = 0;

	get userId(): number
	{
		return this._userId;
	}

	private _accepted: boolean = false;

	get accepted(): boolean
	{
		return this._accepted;
	}

	public flush(): boolean
	{
		return true;
	}

	public parse(wrapper: IMessageDataWrapper): boolean
	{
		this._userId = wrapper.readInt();
		this._accepted = wrapper.readInt() === 1;

		return true;
	}
}
