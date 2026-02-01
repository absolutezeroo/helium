import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {PopularTagsData} from '../../incoming/navigator';

/**
 * Parser for popular room tags result message
 *
 * Based on AS3 PopularRoomTagsResultEventParser
 */
export class PopularRoomTagsResultMessageParser implements IMessageParser
{
	private _data: PopularTagsData | null = null;

	get data(): PopularTagsData | null
	{
		return this._data;
	}

	flush(): boolean
	{
		this._data = null;
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		this._data = new PopularTagsData(wrapper);
		return true;
	}
}
