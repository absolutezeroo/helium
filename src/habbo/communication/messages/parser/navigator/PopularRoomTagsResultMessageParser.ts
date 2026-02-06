import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {PopularTagsData} from '../../incoming/navigator';

/**
 * Parser for popular room tags result message
 *
 * @see source_as/habbo/communication/messages/parser/navigator/PopularRoomTagsResultEventParser.as
 */
export class PopularRoomTagsResultMessageParser implements IMessageParser
{
	private _data: PopularTagsData | null = null;

	get data(): PopularTagsData | null
	{
		return this._data;
	}

	public flush(): boolean
	{
		this._data = null;
		return true;
	}

	public parse(wrapper: IMessageDataWrapper): boolean
	{
		this._data = new PopularTagsData(wrapper);
		return true;
	}
}
