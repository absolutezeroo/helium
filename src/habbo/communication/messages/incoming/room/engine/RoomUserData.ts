/**
 * RoomUserData
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.engine.class_1668
 *
 * Data structure for room users (avatars, pets, bots).
 */
export class RoomUserData
{
	public static readonly USER_TYPE_USER = 1;
	public static readonly USER_TYPE_PET = 2;
	public static readonly USER_TYPE_OLD_BOT = 3;
	public static readonly USER_TYPE_BOT = 4;

	private _roomIndex: number;
	private _x: number = 0;
	private _y: number = 0;
	private _z: number = 0;
	private _dir: number = 0;
	private _name: string = '';
	private _custom: string = '';
	private _figure: string = '';
	private _sex: string = 'M';
	private _webID: number = 0;
	private _userType: number = 1;
	private _groupID: string = '';
	private _groupStatus: number = 0;
	private _groupName: string = '';
	private _achievementScore: number = 0;
	private _isModerator: boolean = false;
	private _subType: string = '';
	private _ownerId: number = 0;
	private _ownerName: string = '';
	private _rarityLevel: number = 0;
	private _hasSaddle: boolean = false;
	private _isRiding: boolean = false;
	private _canBreed: boolean = false;
	private _canHarvest: boolean = false;
	private _canRevive: boolean = false;
	private _hasBreedingPermission: boolean = false;
	private _petLevel: number = 0;
	private _petPosture: string = '';
	private _botSkills: number[] = [];
	private _readOnly: boolean = false;

	constructor(roomIndex: number)
	{
		this._roomIndex = roomIndex;
	}

	get roomIndex(): number
	{
		return this._roomIndex;
	}

	get x(): number
	{
		return this._x;
	}

	set x(value: number)
	{
		if (!this._readOnly) this._x = value;
	}

	get y(): number
	{
		return this._y;
	}

	set y(value: number)
	{
		if (!this._readOnly) this._y = value;
	}

	get z(): number
	{
		return this._z;
	}

	set z(value: number)
	{
		if (!this._readOnly) this._z = value;
	}

	get dir(): number
	{
		return this._dir;
	}

	set dir(value: number)
	{
		if (!this._readOnly) this._dir = value;
	}

	get name(): string
	{
		return this._name;
	}

	set name(value: string)
	{
		if (!this._readOnly) this._name = value;
	}

	get custom(): string
	{
		return this._custom;
	}

	set custom(value: string)
	{
		if (!this._readOnly) this._custom = value;
	}

	get figure(): string
	{
		return this._figure;
	}

	set figure(value: string)
	{
		if (!this._readOnly) this._figure = value;
	}

	get sex(): string
	{
		return this._sex;
	}

	set sex(value: string)
	{
		if (!this._readOnly) this._sex = value;
	}

	get webID(): number
	{
		return this._webID;
	}

	set webID(value: number)
	{
		if (!this._readOnly) this._webID = value;
	}

	get userType(): number
	{
		return this._userType;
	}

	set userType(value: number)
	{
		if (!this._readOnly) this._userType = value;
	}

	get groupID(): string
	{
		return this._groupID;
	}

	set groupID(value: string)
	{
		if (!this._readOnly) this._groupID = value;
	}

	get groupStatus(): number
	{
		return this._groupStatus;
	}

	set groupStatus(value: number)
	{
		if (!this._readOnly) this._groupStatus = value;
	}

	get groupName(): string
	{
		return this._groupName;
	}

	set groupName(value: string)
	{
		if (!this._readOnly) this._groupName = value;
	}

	get achievementScore(): number
	{
		return this._achievementScore;
	}

	set achievementScore(value: number)
	{
		if (!this._readOnly) this._achievementScore = value;
	}

	get isModerator(): boolean
	{
		return this._isModerator;
	}

	set isModerator(value: boolean)
	{
		if (!this._readOnly) this._isModerator = value;
	}

	get subType(): string
	{
		return this._subType;
	}

	set subType(value: string)
	{
		if (!this._readOnly) this._subType = value;
	}

	get ownerId(): number
	{
		return this._ownerId;
	}

	set ownerId(value: number)
	{
		if (!this._readOnly) this._ownerId = value;
	}

	get ownerName(): string
	{
		return this._ownerName;
	}

	set ownerName(value: string)
	{
		if (!this._readOnly) this._ownerName = value;
	}

	get rarityLevel(): number
	{
		return this._rarityLevel;
	}

	set rarityLevel(value: number)
	{
		if (!this._readOnly) this._rarityLevel = value;
	}

	get hasSaddle(): boolean
	{
		return this._hasSaddle;
	}

	set hasSaddle(value: boolean)
	{
		if (!this._readOnly) this._hasSaddle = value;
	}

	get isRiding(): boolean
	{
		return this._isRiding;
	}

	set isRiding(value: boolean)
	{
		if (!this._readOnly) this._isRiding = value;
	}

	get canBreed(): boolean
	{
		return this._canBreed;
	}

	set canBreed(value: boolean)
	{
		if (!this._readOnly) this._canBreed = value;
	}

	get canHarvest(): boolean
	{
		return this._canHarvest;
	}

	set canHarvest(value: boolean)
	{
		if (!this._readOnly) this._canHarvest = value;
	}

	get canRevive(): boolean
	{
		return this._canRevive;
	}

	set canRevive(value: boolean)
	{
		if (!this._readOnly) this._canRevive = value;
	}

	get hasBreedingPermission(): boolean
	{
		return this._hasBreedingPermission;
	}

	set hasBreedingPermission(value: boolean)
	{
		if (!this._readOnly) this._hasBreedingPermission = value;
	}

	get petLevel(): number
	{
		return this._petLevel;
	}

	set petLevel(value: number)
	{
		if (!this._readOnly) this._petLevel = value;
	}

	get petPosture(): string
	{
		return this._petPosture;
	}

	set petPosture(value: string)
	{
		if (!this._readOnly) this._petPosture = value;
	}

	get botSkills(): number[]
	{
		return this._botSkills;
	}

	set botSkills(value: number[])
	{
		if (!this._readOnly) this._botSkills = value;
	}

	setReadOnly(): void
	{
		this._readOnly = true;
	}
}
