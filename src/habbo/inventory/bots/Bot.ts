/**
 * Bot data model
 *
 * Based on AS3 com.sulake.habbo.communication.messages.parser.inventory.bots.class_1726
 */
export class Bot
{
	private _id: number;
	private _name: string;
	private _motto: string;
	private _figure: string;
	private _gender: string;
	private _isSelected: boolean = false;
	private _isUnseen: boolean = false;

	constructor(
		id: number,
		name: string,
		motto: string,
		figure: string,
		gender: string
	)
	{
		this._id = id;
		this._name = name;
		this._motto = motto;
		this._figure = figure;
		this._gender = gender;
	}

	get id(): number
	{
		return this._id;
	}

	get name(): string
	{
		return this._name;
	}

	get motto(): string
	{
		return this._motto;
	}

	get figure(): string
	{
		return this._figure;
	}

	get gender(): string
	{
		return this._gender;
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
		// Nothing to clean up
	}
}
