/**
 * RoomObjectAvatarSleepUpdateMessage
 *
 * Based on AS3: com.sulake.habbo.room.messages.RoomObjectAvatarSleepUpdateMessage
 *
 * Update message for avatar sleep state.
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';

export class RoomObjectAvatarSleepUpdateMessage extends RoomObjectUpdateMessage
{
	private _isSleeping: boolean;

	constructor(isSleeping: boolean)
	{
		super(null, null);
		this._isSleeping = isSleeping;
	}

	get isSleeping(): boolean
	{
		return this._isSleeping;
	}
}
