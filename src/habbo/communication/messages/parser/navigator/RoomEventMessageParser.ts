import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {RoomEventData} from '../../incoming/navigator';

/**
 * Parser for room event message
 *
 * @see source_as/habbo/communication/messages/parser/navigator/RoomEventEventParser.as
 */
export class RoomEventMessageParser implements IMessageParser
{
	private _data: RoomEventData | null = null;

	get data(): RoomEventData | null
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
		this._data = new RoomEventData(wrapper);
		return true;
	}
}
