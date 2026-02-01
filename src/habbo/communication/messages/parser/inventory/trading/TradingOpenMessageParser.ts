import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Parser for trading open message
 */
export class TradingOpenMessageParser implements IMessageParser
{
	private _userOneId: number = 0;
	private _userOneCanTrade: boolean = false;
	private _userTwoId: number = 0;
	private _userTwoCanTrade: boolean = false;

	get userOneId(): number
	{
		return this._userOneId;
	}

	get userOneCanTrade(): boolean
	{
		return this._userOneCanTrade;
	}

	get userTwoId(): number
	{
		return this._userTwoId;
	}

	get userTwoCanTrade(): boolean
	{
		return this._userTwoCanTrade;
	}

	flush(): boolean
	{
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		this._userOneId = wrapper.readInt();
		this._userOneCanTrade = wrapper.readInt() === 1;
		this._userTwoId = wrapper.readInt();
		this._userTwoCanTrade = wrapper.readInt() === 1;

		return true;
	}
}
