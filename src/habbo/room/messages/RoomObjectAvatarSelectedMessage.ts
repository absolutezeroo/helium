/**
 * RoomObjectAvatarSelectedMessage
 *
 * Based on AS3: com.sulake.habbo.room.messages.RoomObjectAvatarSelectedMessage
 *
 * Update message for avatar selection state.
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';

export class RoomObjectAvatarSelectedMessage extends RoomObjectUpdateMessage
{
	private _selected: boolean;

	constructor(selected: boolean)
	{
		super(null, null);
		this._selected = selected;
	}

	get selected(): boolean
	{
		return this._selected;
	}
}
