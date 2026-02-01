import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {NavigatorLiftedRoomData} from '../../incoming/newnavigator';

/**
 * Parser for lifted rooms message
 *
 * Based on AS3 class_1530
 */
export class NavigatorLiftedRoomsMessageParser implements IMessageParser
{
	private _liftedRooms: NavigatorLiftedRoomData[] = [];

	get liftedRooms(): NavigatorLiftedRoomData[]
	{
		return this._liftedRooms;
	}

	flush(): boolean
	{
		this._liftedRooms = [];
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		const count = wrapper.readInt();
		for (let i = 0; i < count; i++)
		{
			this._liftedRooms.push(new NavigatorLiftedRoomData(wrapper));
		}
		return true;
	}
}
