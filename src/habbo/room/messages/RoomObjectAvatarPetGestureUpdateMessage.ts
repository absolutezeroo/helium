/**
 * RoomObjectAvatarPetGestureUpdateMessage
 *
 * Based on AS3: com.sulake.habbo.room.messages.RoomObjectAvatarPetGestureUpdateMessage
 *
 * Update message for pet gesture.
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';

export class RoomObjectAvatarPetGestureUpdateMessage extends RoomObjectUpdateMessage
{
	private _gesture: string;

	constructor(gesture: string)
	{
		super(null, null);
		this._gesture = gesture;
	}

	get gesture(): string
	{
		return this._gesture;
	}
}
