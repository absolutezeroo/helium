import type {IFurnitureItem} from './IFurnitureItem';
import type {IStuffData} from './IStuffData';
import type {FurnitureItemData} from './FurnitureItemData';

/**
 * Furniture item data model
 *
 * Based on AS3 com.sulake.habbo.inventory.items.FurnitureItem
 */
export class FurnitureItem implements IFurnitureItem
{
	private _id: number;
	private _ref: number;
	private _type: number;
	private _category: number;
	private _stuffData: IStuffData | null;
	private _extra: number;
	private _recyclable: boolean;
	private _tradeable: boolean;
	private _groupable: boolean;
	private _sellable: boolean;
	private _isWallItem: boolean;
	private _isRented: boolean;
	private _secondsToExpiration: number;
	private _expirationTimeStamp: number;
	private _hasRentPeriodStarted: boolean;
	private _locked: boolean = false;
	private _flatId: number;
	private _slotId: string;
	private _songId: number;
	private _creationDay: number;
	private _creationMonth: number;
	private _creationYear: number;

	constructor(data: FurnitureItemData)
	{
		this._id = data.itemId;
		this._ref = data.roomItemId;
		this._type = data.itemTypeId;
		this._category = data.category;
		this._stuffData = data.stuffData;
		this._extra = data.extra;
		this._recyclable = data.isRecyclable;
		this._tradeable = data.isTradeable;
		this._groupable = data.isGroupable && !data.isRented;
		this._sellable = data.isSellable;
		this._isWallItem = data.isWallItem;
		this._isRented = data.isRented;
		this._secondsToExpiration = data.secondsToExpiration;
		this._expirationTimeStamp = data.expirationTimeStamp;
		this._hasRentPeriodStarted = data.hasRentPeriodStarted;
		this._flatId = data.flatId;
		this._slotId = data.slotId;
		this._songId = data.songId;
		this._creationDay = data.creationDay;
		this._creationMonth = data.creationMonth;
		this._creationYear = data.creationYear;
	}

	get id(): number
	{
		return this._id;
	}

	get ref(): number
	{
		return this._ref;
	}

	get type(): number
	{
		return this._type;
	}

	get category(): number
	{
		return this._category;
	}

	get stuffData(): IStuffData | null
	{
		return this._stuffData;
	}

	set stuffData(value: IStuffData | null)
	{
		this._stuffData = value;
	}

	get extra(): number
	{
		return this._extra;
	}

	get recyclable(): boolean
	{
		return this._recyclable;
	}

	get tradeable(): boolean
	{
		return this._tradeable;
	}

	get groupable(): boolean
	{
		return this._groupable;
	}

	get sellable(): boolean
	{
		return this._sellable;
	}

	get isWallItem(): boolean
	{
		return this._isWallItem;
	}

	get isRented(): boolean
	{
		return this._isRented;
	}

	/**
	 * Get seconds until expiration
	 * Calculates remaining time if rent period has started
	 */
	get secondsToExpiration(): number
	{
		if (this._secondsToExpiration === -1)
		{
			return -1;
		}

		if (this._hasRentPeriodStarted)
		{
			const elapsed = (Date.now() - this._expirationTimeStamp) / 1000;
			const remaining = this._secondsToExpiration - elapsed;

			return Math.max(0, Math.floor(remaining));
		}

		return this._secondsToExpiration;
	}

	get hasRentPeriodStarted(): boolean
	{
		return this._hasRentPeriodStarted;
	}

	get locked(): boolean
	{
		return this._locked;
	}

	set locked(value: boolean)
	{
		this._locked = value;
	}

	get flatId(): number
	{
		return this._flatId;
	}

	get slotId(): string
	{
		return this._slotId;
	}

	get songId(): number
	{
		return this._songId;
	}

	get creationDay(): number
	{
		return this._creationDay;
	}

	get creationMonth(): number
	{
		return this._creationMonth;
	}

	get creationYear(): number
	{
		return this._creationYear;
	}

	/**
	 * Update item from new data
	 */
	update(data: FurnitureItemData): void
	{
		this._ref = data.roomItemId;
		this._type = data.itemTypeId;
		this._category = data.category;
		this._stuffData = data.stuffData;
		this._extra = data.extra;
		this._recyclable = data.isRecyclable;
		this._tradeable = data.isTradeable;
		this._groupable = data.isGroupable && !data.isRented;
		this._sellable = data.isSellable;
		this._isWallItem = data.isWallItem;
		this._isRented = data.isRented;
		this._secondsToExpiration = data.secondsToExpiration;
		this._expirationTimeStamp = data.expirationTimeStamp;
		this._hasRentPeriodStarted = data.hasRentPeriodStarted;
		this._flatId = data.flatId;
		this._slotId = data.slotId;
		this._songId = data.songId;
		this._creationDay = data.creationDay;
		this._creationMonth = data.creationMonth;
		this._creationYear = data.creationYear;
	}
}
