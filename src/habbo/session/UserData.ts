import type {IUserData} from './IUserData';

/**
 * User data type constants
 */
export const UserDataType = {
	USER: 1,
	PET: 2,
	BOT: 3,
	RENTABLE_BOT: 4
} as const;

/**
 * Room user data
 * Based on AS3 com.sulake.habbo.session.UserData
 */
export class UserData implements IUserData
{
	private readonly _roomObjectId: number;
	private _type: number = 0;
	private _webID: number = 0;

	private _name: string = '';
	private _figure: string = '';
	private _sex: string = '';
	private _custom: string = '';
	private _achievementScore: number = 0;

	private _groupID: string = '';
	private _groupName: string = '';
	private _groupStatus: number = 0;

	private _ownerId: number = 0;
	private _ownerName: string = '';

	private _petLevel: number = 0;
	private _rarityLevel: number = 0;
	private _hasSaddle: boolean = false;
	private _isRiding: boolean = false;
	private _canBreed: boolean = false;
	private _canHarvest: boolean = false;
	private _canRevive: boolean = false;
	private _hasBreedingPermission: boolean = false;

	private _botSkills: number[] = [];
	private _botSkillData: unknown[] = [];

	private _isModerator: boolean = false;

	constructor(roomObjectId: number)
	{
		this._roomObjectId = roomObjectId;
	}

	get roomObjectId(): number
	{
		return this._roomObjectId;
	}

	get type(): number
	{
		return this._type;
	}

	set type(value: number)
	{
		this._type = value;
	}

	get webID(): number
	{
		return this._webID;
	}

	set webID(value: number)
	{
		this._webID = value;
	}

	get name(): string
	{
		return this._name;
	}

	set name(value: string)
	{
		this._name = value;
	}

	get figure(): string
	{
		return this._figure;
	}

	set figure(value: string)
	{
		this._figure = value;
	}

	get sex(): string
	{
		return this._sex;
	}

	set sex(value: string)
	{
		this._sex = value;
	}

	get custom(): string
	{
		return this._custom;
	}

	set custom(value: string)
	{
		this._custom = value;
	}

	get achievementScore(): number
	{
		return this._achievementScore;
	}

	set achievementScore(value: number)
	{
		this._achievementScore = value;
	}

	get groupID(): string
	{
		return this._groupID;
	}

	set groupID(value: string)
	{
		this._groupID = value;
	}

	get groupName(): string
	{
		return this._groupName;
	}

	set groupName(value: string)
	{
		this._groupName = value;
	}

	get groupStatus(): number
	{
		return this._groupStatus;
	}

	set groupStatus(value: number)
	{
		this._groupStatus = value;
	}

	get ownerId(): number
	{
		return this._ownerId;
	}

	set ownerId(value: number)
	{
		this._ownerId = value;
	}

	get ownerName(): string
	{
		return this._ownerName;
	}

	set ownerName(value: string)
	{
		this._ownerName = value;
	}

	get petLevel(): number
	{
		return this._petLevel;
	}

	set petLevel(value: number)
	{
		this._petLevel = value;
	}

	get rarityLevel(): number
	{
		return this._rarityLevel;
	}

	set rarityLevel(value: number)
	{
		this._rarityLevel = value;
	}

	get hasSaddle(): boolean
	{
		return this._hasSaddle;
	}

	set hasSaddle(value: boolean)
	{
		this._hasSaddle = value;
	}

	get isRiding(): boolean
	{
		return this._isRiding;
	}

	set isRiding(value: boolean)
	{
		this._isRiding = value;
	}

	get canBreed(): boolean
	{
		return this._canBreed;
	}

	set canBreed(value: boolean)
	{
		this._canBreed = value;
	}

	get canHarvest(): boolean
	{
		return this._canHarvest;
	}

	set canHarvest(value: boolean)
	{
		this._canHarvest = value;
	}

	get canRevive(): boolean
	{
		return this._canRevive;
	}

	set canRevive(value: boolean)
	{
		this._canRevive = value;
	}

	get hasBreedingPermission(): boolean
	{
		return this._hasBreedingPermission;
	}

	set hasBreedingPermission(value: boolean)
	{
		this._hasBreedingPermission = value;
	}

	get botSkills(): number[]
	{
		return this._botSkills;
	}

	set botSkills(value: number[])
	{
		this._botSkills = value;
	}

	get botSkillData(): unknown[]
	{
		return this._botSkillData;
	}

	set botSkillData(value: unknown[])
	{
		this._botSkillData = value;
	}

	get isModerator(): boolean
	{
		return this._isModerator;
	}

	set isModerator(value: boolean)
	{
		this._isModerator = value;
	}
}
