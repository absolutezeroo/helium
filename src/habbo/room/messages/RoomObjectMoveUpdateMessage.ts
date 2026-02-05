/**
 * RoomObjectMoveUpdateMessage
 *
 * Based on AS3: com.sulake.habbo.room.messages.RoomObjectMoveUpdateMessage
 *
 * Update message for moving objects with target location and animation time.
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';
import type {IVector3d} from '@room/utils/IVector3d';

export class RoomObjectMoveUpdateMessage extends RoomObjectUpdateMessage
{
	constructor(
		location: IVector3d | null,
		direction: IVector3d | null,
		targetLocation: IVector3d | null = null,
		animationTime: number = 500,
		skipPositionUpdate: boolean = false
	)
	{
		super(location, direction);
		this._targetLoc = targetLocation;
		this._animationTime = animationTime;
		this._skipPositionUpdate = skipPositionUpdate;
	}

	private _targetLoc: IVector3d | null;

	get targetLoc(): IVector3d | null
	{
		return this._targetLoc;
	}

	private _animationTime: number;

	get animationTime(): number
	{
		return this._animationTime;
	}

	private _skipPositionUpdate: boolean;

	get skipPositionUpdate(): boolean
	{
		return this._skipPositionUpdate;
	}
}
