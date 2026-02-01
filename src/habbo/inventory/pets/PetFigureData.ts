/**
 * Pet figure/appearance data
 *
 * Based on AS3 com.sulake.habbo.communication.messages.parser.inventory.pets.class_1657
 */
export class PetFigureData
{
	private _typeId: number;
	private _paletteId: number;
	private _color: string;
	private _breedId: number;
	private _customPartCount: number;
	private _customParts: number[];

	constructor(
		typeId: number,
		paletteId: number,
		color: string,
		breedId: number,
		customPartCount: number,
		customParts: number[]
	)
	{
		this._typeId = typeId;
		this._paletteId = paletteId;
		this._color = color;
		this._breedId = breedId;
		this._customPartCount = customPartCount;
		this._customParts = customParts;
	}

	get typeId(): number
	{
		return this._typeId;
	}

	get paletteId(): number
	{
		return this._paletteId;
	}

	get color(): string
	{
		return this._color;
	}

	get breedId(): number
	{
		return this._breedId;
	}

	get customPartCount(): number
	{
		return this._customPartCount;
	}

	get customParts(): number[]
	{
		return this._customParts;
	}

	/**
	 * Generate figure string for rendering
	 */
	get figureString(): string
	{
		let result = `${this._typeId} ${this._paletteId} ${this._color}`;

		result += ` ${this._customPartCount}`;

		for (const part of this._customParts)
		{
			result += ` ${part}`;
		}

		return result;
	}
}
