/**
 * RoomObjectAvatarUpdateMessage
 *
 * Based on AS3: com.sulake.habbo.room.messages.RoomObjectAvatarUpdateMessage
 *
 * Update message for avatar with head direction and vertical offset.
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';
import type {IVector3d} from '@room/utils/IVector3d';

export class RoomObjectAvatarUpdateMessage extends RoomObjectUpdateMessage
{
	private _dirHead: number;
	private _canStandUp: boolean;
	private _baseY: number;

	constructor(
		location: IVector3d | null,
		direction: IVector3d | null,
		dirHead: number,
		canStandUp: boolean,
		baseY: number
	)
	{
		super(location, direction);
		this._dirHead = dirHead;
		this._canStandUp = canStandUp;
		this._baseY = baseY;
	}

	get dirHead(): number
	{
		return this._dirHead;
	}

	get canStandUp(): boolean
	{
		return this._canStandUp;
	}

	get baseY(): number
	{
		return this._baseY;
	}
}
