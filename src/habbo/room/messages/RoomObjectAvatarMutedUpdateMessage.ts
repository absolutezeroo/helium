/**
 * RoomObjectAvatarMutedUpdateMessage
 *
 * Based on AS3: com.sulake.habbo.room.messages.RoomObjectAvatarMutedUpdateMessage
 *
 * Update message for avatar muted state.
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';

export class RoomObjectAvatarMutedUpdateMessage extends RoomObjectUpdateMessage
{
	private _isMuted: boolean;

	constructor(isMuted: boolean)
	{
		super(null, null);
		this._isMuted = isMuted;
	}

	get isMuted(): boolean
	{
		return this._isMuted;
	}
}
