/**
 * RoomObjectAvatarGestureUpdateMessage
 *
 * Based on AS3: com.sulake.habbo.room.messages.RoomObjectAvatarGestureUpdateMessage
 *
 * Update message for avatar gesture (wave, etc.).
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';

export class RoomObjectAvatarGestureUpdateMessage extends RoomObjectUpdateMessage
{
	private _gesture: number;

	constructor(gesture: number)
	{
		super(null, null);
		this._gesture = gesture;
	}

	get gesture(): number
	{
		return this._gesture;
	}
}
