import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for navigator settings message
 *
 * @see source_as/habbo/communication/messages/parser/navigator/NavigatorSettingsEventParser.as
 */
export class NavigatorSettingsMessageParser implements IMessageParser
{
	private _homeRoomId: number = 0;

	get homeRoomId(): number
	{
		return this._homeRoomId;
	}

	private _roomIdToEnter: number = 0;

	get roomIdToEnter(): number
	{
		return this._roomIdToEnter;
	}

	public flush(): boolean
	{
		this._homeRoomId = 0;
		this._roomIdToEnter = 0;
		return true;
	}

	public parse(wrapper: IMessageDataWrapper): boolean
	{
		this._homeRoomId = wrapper.readInt();
		this._roomIdToEnter = wrapper.readInt();
		return true;
	}
}
