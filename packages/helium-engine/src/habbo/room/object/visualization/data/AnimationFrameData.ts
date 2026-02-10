/**
 * AnimationFrameData
 *
 * @see com.sulake.habbo.room.object.visualization.data.AnimationFrameData
 *
 * Static frame data definition: id, x, y, randomX, randomY, repeats.
 */
export class AnimationFrameData
{
	private _id: number;
	private _x: number;
	private _y: number;
	private _randomX: number;
	private _randomY: number;
	private _repeats: number;

	constructor(id: number, x: number, y: number, randomX: number, randomY: number, repeats: number)
	{
		this._id = id;
		this._x = x;
		this._y = y;
		this._randomX = randomX;
		this._randomY = randomY;
		this._repeats = repeats;
	}

	get id(): number
	{
		return this._id;
	}

	get x(): number
	{
		return this._x;
	}

	get y(): number
	{
		return this._y;
	}

	get randomX(): number
	{
		return this._randomX;
	}

	get randomY(): number
	{
		return this._randomY;
	}

	get repeats(): number
	{
		return this._repeats;
	}

	hasDirectionalOffsets(): boolean
	{
		return false;
	}

	getX(_direction: number): number
	{
		return this._x;
	}

	getY(_direction: number): number
	{
		return this._y;
	}
}
