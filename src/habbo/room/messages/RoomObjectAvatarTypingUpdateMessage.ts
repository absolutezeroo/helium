/**
 * RoomObjectAvatarTypingUpdateMessage
 *
 * Based on AS3: com.sulake.habbo.room.messages.RoomObjectAvatarTypingUpdateMessage
 *
 * Update message for avatar typing indicator.
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';

export class RoomObjectAvatarTypingUpdateMessage extends RoomObjectUpdateMessage
{
	private _isTyping: boolean;

	constructor(isTyping: boolean)
	{
		super(null, null);
		this._isTyping = isTyping;
	}

	get isTyping(): boolean
	{
		return this._isTyping;
	}
}
