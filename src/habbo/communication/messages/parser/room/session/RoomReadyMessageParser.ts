/**
 * RoomReadyMessageParser
 *
 * Based on AS3: com.sulake.habbo.communication.messages.parser.room.session.RoomReadyMessageEventParser
 *
 * Parser for room ready message (room is loaded and ready).
 */
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

export class RoomReadyMessageParser implements IMessageParser
{
	private _roomType: string = '';
	private _roomId: number = 0;

	get roomType(): string
	{
		return this._roomType;
	}

	get roomId(): number
	{
		return this._roomId;
	}

	flush(): boolean
	{
		this._roomType = '';
		this._roomId = 0;
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		this._roomType = wrapper.readString();
		this._roomId = wrapper.readInt();
		return true;
	}
}
