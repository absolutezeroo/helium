import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for converted room id message
 *
 * @see source_as/habbo/communication/messages/parser/navigator/ConvertedRoomIdEventParser.as
 */
export class ConvertedRoomIdMessageParser implements IMessageParser
{
	private _globalId: string = '';

	get globalId(): string
	{
		return this._globalId;
	}

	private _convertedId: number = 0;

	get convertedId(): number
	{
		return this._convertedId;
	}

	public flush(): boolean
	{
		this._globalId = '';
		this._convertedId = 0;
		return true;
	}

	public parse(wrapper: IMessageDataWrapper): boolean
	{
		this._globalId = wrapper.readString();
		this._convertedId = wrapper.readInt();
		return true;
	}
}
