/**
 * RoomPlaneBitmapMask
 *
 * @see com.sulake.habbo.room.object.visualization.room.RoomPlaneBitmapMask
 *
 * Simple data object storing bitmap mask type and left/right side locations.
 */
export class RoomPlaneBitmapMask
{
	private _type: string;
	private _leftSideLoc: number;
	private _rightSideLoc: number;

	constructor(type: string, leftSideLoc: number, rightSideLoc: number)
	{
		this._type = type;
		this._leftSideLoc = leftSideLoc;
		this._rightSideLoc = rightSideLoc;
	}

	get type(): string
	{
		return this._type;
	}

	get leftSideLoc(): number
	{
		return this._leftSideLoc;
	}

	get rightSideLoc(): number
	{
		return this._rightSideLoc;
	}
}
