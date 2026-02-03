/**
 * FurnitureWallData
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.engine.class_1710
 *
 * Data class for wall furniture items.
 */
export class FurnitureWallData
{
	private _id: number;
	private _type: number;
	private _isOldFormat: boolean;
	private _wallX: number = 0;
	private _wallY: number = 0;
	private _localX: number = 0;
	private _localY: number = 0;
	private _y: number = 0;
	private _z: number = 0;
	private _dir: string = '';
	private _state: number = 0;
	private _data: string = '';
	private _usagePolicy: number = 0;
	private _ownerId: number = 0;
	private _ownerName: string = '';
	private _secondsToExpiration: number = 0;
	private _readOnly: boolean = false;

	constructor(id: number, type: number, isOldFormat: boolean)
	{
		this._id = id;
		this._type = type;
		this._isOldFormat = isOldFormat;
	}

	get id(): number
	{
		return this._id;
	}

	get type(): number
	{
		return this._type;
	}

	set type(value: number)
	{
		if (!this._readOnly)
		{
			this._type = value;
		}
	}

	get isOldFormat(): boolean
	{
		return this._isOldFormat;
	}

	get wallX(): number
	{
		return this._wallX;
	}

	set wallX(value: number)
	{
		if (!this._readOnly)
		{
			this._wallX = value;
		}
	}

	get wallY(): number
	{
		return this._wallY;
	}

	set wallY(value: number)
	{
		if (!this._readOnly)
		{
			this._wallY = value;
		}
	}

	get localX(): number
	{
		return this._localX;
	}

	set localX(value: number)
	{
		if (!this._readOnly)
		{
			this._localX = value;
		}
	}

	get localY(): number
	{
		return this._localY;
	}

	set localY(value: number)
	{
		if (!this._readOnly)
		{
			this._localY = value;
		}
	}

	get y(): number
	{
		return this._y;
	}

	set y(value: number)
	{
		if (!this._readOnly)
		{
			this._y = value;
		}
	}

	get z(): number
	{
		return this._z;
	}

	set z(value: number)
	{
		if (!this._readOnly)
		{
			this._z = value;
		}
	}

	get dir(): string
	{
		return this._dir;
	}

	set dir(value: string)
	{
		if (!this._readOnly)
		{
			this._dir = value;
		}
	}

	get state(): number
	{
		return this._state;
	}

	set state(value: number)
	{
		if (!this._readOnly)
		{
			this._state = value;
		}
	}

	get data(): string
	{
		return this._data;
	}

	set data(value: string)
	{
		if (!this._readOnly)
		{
			this._data = value;
		}
	}

	get usagePolicy(): number
	{
		return this._usagePolicy;
	}

	set usagePolicy(value: number)
	{
		if (!this._readOnly)
		{
			this._usagePolicy = value;
		}
	}

	get ownerId(): number
	{
		return this._ownerId;
	}

	set ownerId(value: number)
	{
		if (!this._readOnly)
		{
			this._ownerId = value;
		}
	}

	get ownerName(): string
	{
		return this._ownerName;
	}

	set ownerName(value: string)
	{
		if (!this._readOnly)
		{
			this._ownerName = value;
		}
	}

	get secondsToExpiration(): number
	{
		return this._secondsToExpiration;
	}

	set secondsToExpiration(value: number)
	{
		if (!this._readOnly)
		{
			this._secondsToExpiration = value;
		}
	}

	setReadOnly(): void
	{
		this._readOnly = true;
	}
}
