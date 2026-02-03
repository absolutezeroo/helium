/**
 * RoomObjectAvatarPlayerValueUpdateMessage
 *
 * Based on AS3: com.sulake.habbo.room.messages.RoomObjectAvatarPlayerValueUpdateMessage
 *
 * Update message for avatar player value (game score, etc.).
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';

export class RoomObjectAvatarPlayerValueUpdateMessage extends RoomObjectUpdateMessage
{
	private _value: number;

	constructor(value: number)
	{
		super(null, null);
		this._value = value;
	}

	get value(): number
	{
		return this._value;
	}
}
