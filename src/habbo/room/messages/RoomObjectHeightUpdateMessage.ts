/**
 * RoomObjectHeightUpdateMessage
 *
 * Based on AS3: com.sulake.habbo.room.messages.RoomObjectHeightUpdateMessage
 *
 * Update message for furniture height changes.
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';
import type {IVector3d} from '@room/utils/IVector3d';

export class RoomObjectHeightUpdateMessage extends RoomObjectUpdateMessage
{
	private _height: number;

	constructor(location: IVector3d | null, direction: IVector3d | null, height: number)
	{
		super(location, direction);
		this._height = height;
	}

	get height(): number
	{
		return this._height;
	}
}
