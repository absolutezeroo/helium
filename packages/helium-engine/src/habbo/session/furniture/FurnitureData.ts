import type {IFurnitureData} from './IFurnitureData';

/**
 * Furniture data implementation
 *
 * Stores all metadata about a single furniture item (floor or wall).
 *
 * @see source_as_win63/habbo/session/furniture/FurnitureData.as
 * @see source_as_flash/com/sulake/habbo/session/furniture/FurnitureData.as
 */
export class FurnitureData implements IFurnitureData
{
	private _type: string;
	private _id: number;
	private _fullName: string;
	private _className: string;
	private _localizedName: string;
	private _description: string;
	private _revision: number;
	private _tileSizeX: number;
	private _tileSizeY: number;
	private _tileSizeZ: number;
	private _colours: number[];
	private _hasIndexedColor: boolean;
	private _colourIndex: number;
	private _adUrl: string;
	private _purchaseOfferId: number;
	private _purchaseCouldBeUsedForBuyout: boolean;
	private _rentOfferId: number;
	private _rentCouldBeUsedForBuyout: boolean;
	private _availableForBuildersClub: boolean;
	private _customParams: string;
	private _category: number;
	private _canStandOn: boolean;
	private _canSitOn: boolean;
	private _canLayOn: boolean;
	private _excludedFromDynamic: boolean;
	private _furniLine: string;

	constructor(
		type: string,
		id: number,
		fullName: string,
		className: string,
		localizedName: string,
		description: string,
		revision: number,
		tileSizeX: number,
		tileSizeY: number,
		tileSizeZ: number,
		colours: number[],
		hasIndexedColor: boolean,
		colourIndex: number,
		adUrl: string,
		purchaseOfferId: number,
		purchaseCouldBeUsedForBuyout: boolean,
		rentOfferId: number,
		rentCouldBeUsedForBuyout: boolean,
		availableForBuildersClub: boolean,
		customParams: string,
		category: number,
		canStandOn: boolean,
		canSitOn: boolean,
		canLayOn: boolean,
		excludedFromDynamic: boolean,
		furniLine: string
	)
	{
		this._type = type;
		this._id = id;
		this._fullName = fullName;
		this._className = className;
		this._localizedName = localizedName;
		this._description = description;
		this._revision = revision;
		this._tileSizeX = tileSizeX;
		this._tileSizeY = tileSizeY;
		this._tileSizeZ = tileSizeZ;
		this._colours = colours;
		this._hasIndexedColor = hasIndexedColor;
		this._colourIndex = colourIndex;
		this._adUrl = adUrl;
		this._purchaseOfferId = purchaseOfferId;
		this._purchaseCouldBeUsedForBuyout = purchaseCouldBeUsedForBuyout;
		this._rentOfferId = rentOfferId;
		this._rentCouldBeUsedForBuyout = rentCouldBeUsedForBuyout;
		this._availableForBuildersClub = availableForBuildersClub;
		this._customParams = customParams;
		this._category = category;
		this._canStandOn = canStandOn;
		this._canSitOn = canSitOn;
		this._canLayOn = canLayOn;
		this._excludedFromDynamic = excludedFromDynamic;
		this._furniLine = furniLine;
	}

	get type(): string
	{
		return this._type;
	}

	get id(): number
	{
		return this._id;
	}

	get className(): string
	{
		return this._className;
	}

	get fullName(): string
	{
		return this._fullName;
	}

	get hasIndexedColor(): boolean
	{
		return this._hasIndexedColor;
	}

	get colourIndex(): number
	{
		return this._colourIndex;
	}

	get revision(): number
	{
		return this._revision;
	}

	get tileSizeX(): number
	{
		return this._tileSizeX;
	}

	get tileSizeY(): number
	{
		return this._tileSizeY;
	}

	get tileSizeZ(): number
	{
		return this._tileSizeZ;
	}

	get colours(): number[]
	{
		return this._colours;
	}

	get localizedName(): string
	{
		return this._localizedName;
	}

	get description(): string
	{
		return this._description;
	}

	get adUrl(): string
	{
		return this._adUrl;
	}

	get purchaseOfferId(): number
	{
		return this._purchaseOfferId;
	}

	get rentOfferId(): number
	{
		return this._rentOfferId;
	}

	get customParams(): string
	{
		return this._customParams;
	}

	get category(): number
	{
		return this._category;
	}

	get purchaseCouldBeUsedForBuyout(): boolean
	{
		return this._purchaseCouldBeUsedForBuyout;
	}

	get rentCouldBeUsedForBuyout(): boolean
	{
		return this._rentCouldBeUsedForBuyout;
	}

	get availableForBuildersClub(): boolean
	{
		return this._availableForBuildersClub;
	}

	get canStandOn(): boolean
	{
		return this._canStandOn;
	}

	get canSitOn(): boolean
	{
		return this._canSitOn;
	}

	get canLayOn(): boolean
	{
		return this._canLayOn;
	}

	get isExternalImageType(): boolean
	{
		return (this._adUrl !== null && this._adUrl.length > 0);
	}

	get excludedFromDynamic(): boolean
	{
		return this._excludedFromDynamic;
	}

	get furniLine(): string
	{
		return this._furniLine;
	}
}
