/**
 * RoomPlaneMaskData
 *
 * Based on AS3: com.sulake.habbo.room.object.RoomPlaneMaskData
 */
export class RoomPlaneMaskData
{
	private _leftSideLoc: number;
	private _rightSideLoc: number;
	private _leftSideLength: number;
	private _rightSideLength: number;

	constructor(leftSideLoc: number, rightSideLoc: number, leftSideLength: number, rightSideLength: number)
	{
		this._leftSideLoc = leftSideLoc;
		this._rightSideLoc = rightSideLoc;
		this._leftSideLength = leftSideLength;
		this._rightSideLength = rightSideLength;
	}

	get leftSideLoc(): number
	{
		return this._leftSideLoc;
	}

	get rightSideLoc(): number
	{
		return this._rightSideLoc;
	}

	get leftSideLength(): number
	{
		return this._leftSideLength;
	}

	get rightSideLength(): number
	{
		return this._rightSideLength;
	}
}
