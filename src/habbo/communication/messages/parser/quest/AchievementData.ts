import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Achievement data - holds all fields for a single achievement
 *
 * @see source_as/habbo/communication/messages/incoming/inventory/achievements/class_1724.as
 */
export class AchievementData
{
	public static readonly STATE_UNKNOWN: number = -1;
	public static readonly STATE_INACTIVE: number = 0;
	public static readonly STATE_STARTED: number = 1;
	public static readonly STATE_COMPLETED: number = 2;

	private _achievementId: number = 0;
	private _level: number = 0;
	private _badgeId: string = '';
	private _scoreAtStartOfLevel: number = 0;
	private _scoreLimit: number = 0;
	private _levelRewardPoints: number = 0;
	private _levelRewardPointType: number = 0;
	private _currentPoints: number = 0;
	private _finalLevel: boolean = false;
	private _category: string = '';
	private _subCategory: string = '';
	private _levelCount: number = 0;
	private _displayMethod: number = 0;
	private _state: number = 0;

	constructor(wrapper: IMessageDataWrapper)
	{
		this._achievementId = wrapper.readInt();
		this._level = wrapper.readInt();
		this._badgeId = wrapper.readString();
		this._scoreAtStartOfLevel = wrapper.readInt();
		this._scoreLimit = Math.max(1, wrapper.readInt());
		this._levelRewardPoints = wrapper.readInt();
		this._levelRewardPointType = wrapper.readInt();
		this._currentPoints = wrapper.readInt();
		this._finalLevel = wrapper.readBoolean();
		this._category = wrapper.readString();
		this._subCategory = wrapper.readString();
		this._levelCount = wrapper.readInt();
		this._displayMethod = wrapper.readInt();
		this._state = wrapper.readShort();
	}

	get achievementId(): number
	{
		return this._achievementId;
	}

	get level(): number
	{
		return this._level;
	}

	get badgeId(): string
	{
		return this._badgeId;
	}

	get scoreAtStartOfLevel(): number
	{
		return this._scoreAtStartOfLevel;
	}

	get scoreLimit(): number
	{
		return this._scoreLimit - this._scoreAtStartOfLevel;
	}

	get levelRewardPoints(): number
	{
		return this._levelRewardPoints;
	}

	get levelRewardPointType(): number
	{
		return this._levelRewardPointType;
	}

	get currentPoints(): number
	{
		return this._currentPoints - this._scoreAtStartOfLevel;
	}

	get finalLevel(): boolean
	{
		return this._finalLevel;
	}

	get category(): string
	{
		return this._category;
	}

	get subCategory(): string
	{
		return this._subCategory;
	}

	get levelCount(): number
	{
		return this._levelCount;
	}

	get displayMethod(): number
	{
		return this._displayMethod;
	}

	get state(): number
	{
		return this._state;
	}

	get firstLevelAchieved(): boolean
	{
		return this._level > 1 || this._finalLevel;
	}

	setMaxProgress(): void
	{
		this._currentPoints = this._scoreLimit;
	}
}
