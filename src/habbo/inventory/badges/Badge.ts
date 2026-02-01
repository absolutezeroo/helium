/**
 * Badge data model
 *
 * Based on AS3 com.sulake.habbo.inventory.badges.Badge (ENGINE only)
 */
export class Badge
{
	private _badgeId: string;
	private _name: string;
	private _description: string;
	private _isInUse: boolean = false;
	private _isSelected: boolean = false;
	private _isUnseen: boolean = false;

	constructor(
		badgeId: string,
		name: string,
		description: string,
		isUnseen: boolean = false
	)
	{
		this._badgeId = badgeId;
		this._name = name;
		this._description = description;
		this._isUnseen = isUnseen;
	}

	get badgeId(): string
	{
		return this._badgeId;
	}

	get name(): string
	{
		return this._name;
	}

	get description(): string
	{
		return this._description;
	}

	get isInUse(): boolean
	{
		return this._isInUse;
	}

	set isInUse(value: boolean)
	{
		this._isInUse = value;
	}

	get isSelected(): boolean
	{
		return this._isSelected;
	}

	set isSelected(value: boolean)
	{
		this._isSelected = value;
	}

	get isUnseen(): boolean
	{
		return this._isUnseen;
	}

	set isUnseen(value: boolean)
	{
		this._isUnseen = value;
	}

	dispose(): void
	{
		// Nothing to clean up for ENGINE-only version
	}
}
