import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for flat created message
 *
 * @see source_as/habbo/communication/messages/parser/navigator/FlatCreatedEventParser.as
 */
export class FlatCreatedMessageParser implements IMessageParser
{
	private _flatId: number = 0;

	get flatId(): number
	{
		return this._flatId;
	}

	private _flatName: string = '';

	get flatName(): string
	{
		return this._flatName;
	}

	public flush(): boolean
	{
		this._flatId = 0;
		this._flatName = '';
		return true;
	}

	public parse(wrapper: IMessageDataWrapper): boolean
	{
		this._flatId = wrapper.readInt();
		this._flatName = wrapper.readString();
		return true;
	}
}
