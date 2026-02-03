/**
 * RoomObjectAvatarDirectionUpdateMessage
 *
 * Based on AS3: com.sulake.habbo.room.messages.RoomObjectAvatarDirectionUpdateMessage
 *
 * Update message for avatar head direction only.
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';

export class RoomObjectAvatarDirectionUpdateMessage extends RoomObjectUpdateMessage
{
	private _dirHead: number;

	constructor(dirHead: number)
	{
		super(null, null);
		this._dirHead = dirHead;
	}

	get dirHead(): number
	{
		return this._dirHead;
	}
}
