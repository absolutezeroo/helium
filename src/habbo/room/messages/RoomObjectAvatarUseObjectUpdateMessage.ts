/**
 * RoomObjectAvatarUseObjectUpdateMessage
 *
 * Based on AS3: com.sulake.habbo.room.messages.RoomObjectAvatarUseObjectUpdateMessage
 *
 * Update message for avatar using a carried object.
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';

export class RoomObjectAvatarUseObjectUpdateMessage extends RoomObjectUpdateMessage
{
	private _itemType: number;

	constructor(itemType: number)
	{
		super(null, null);
		this._itemType = itemType;
	}

	get itemType(): number
	{
		return this._itemType;
	}
}
