/**
 * RoomObjectAvatarCarryObjectUpdateMessage
 *
 * Based on AS3: com.sulake.habbo.room.messages.RoomObjectAvatarCarryObjectUpdateMessage
 *
 * Update message for avatar carrying an object (drink, etc.).
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';

export class RoomObjectAvatarCarryObjectUpdateMessage extends RoomObjectUpdateMessage
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
