import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {CompetitionRoomsData} from '../../incoming/navigator';

/**
 * Parser for competition rooms data message
 *
 * Based on AS3 CompetitionRoomsDataMessageEventParser
 */
export class CompetitionRoomsDataMessageParser implements IMessageParser
{
	private _data: CompetitionRoomsData | null = null;

	get data(): CompetitionRoomsData | null
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
		this._data = new CompetitionRoomsData(wrapper);
		return true;
	}
}
