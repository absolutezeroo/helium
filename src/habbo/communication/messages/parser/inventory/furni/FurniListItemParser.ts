import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IStuffData} from '@habbo/inventory/items/IStuffData';
import type {FurnitureItemData} from '@habbo/inventory/items/FurnitureItemData';
import {StuffDataFactory} from '@habbo/inventory/items/stuffdata';

/**
 * Parser for a single furniture item in inventory
 *
 * Based on AS3 com.sulake.habbo.communication.messages.incoming.inventory.furni.class_1707
 */
export class FurniListItemParser
{
	private static readonly WALL_ITEM_TYPE = 'I';
	private static readonly FLOOR_ITEM_TYPE = 'S';

	private _itemId: number = 0;
	private _itemType: string = '';
	private _roomItemId: number = 0;
	private _itemTypeId: number = 0;
	private _category: number = 0;
	private _stuffData: IStuffData | null = null;
	private _isRecyclable: boolean = false;
	private _isTradeable: boolean = false;
	private _isGroupable: boolean = false;
	private _isSellable: boolean = false;
	private _secondsToExpiration: number = -1;
	private _expirationTimeStamp: number = 0;
	private _isRented: boolean = false;
	private _hasRentPeriodStarted: boolean = false;
	private _flatId: number = 0;
	private _isWallItem: boolean = false;
	private _slotId: string = '';
	private _extra: number = 0;

	constructor(wrapper: IMessageDataWrapper)
	{
		this.parse(wrapper);
	}

	private parse(wrapper: IMessageDataWrapper): void
	{
		this._itemId = wrapper.readInt();
		this._itemType = wrapper.readString();
		this._roomItemId = wrapper.readInt();
		this._itemTypeId = wrapper.readInt();
		this._category = wrapper.readInt();
		this._stuffData = StuffDataFactory.parseStuffData(wrapper);
		this._isRecyclable = wrapper.readBoolean();
		this._isTradeable = wrapper.readBoolean();
		this._isGroupable = wrapper.readBoolean();
		this._isSellable = wrapper.readBoolean();
		this._secondsToExpiration = wrapper.readInt();
		this._expirationTimeStamp = Date.now();

		if (this._secondsToExpiration > -1)
		{
			this._isRented = true;
		}
		else
		{
			this._isRented = false;
			this._secondsToExpiration = -1;
		}

		this._hasRentPeriodStarted = wrapper.readBoolean();
		this._flatId = wrapper.readInt();
		this._isWallItem = this._itemType === FurniListItemParser.WALL_ITEM_TYPE;

		if (this._itemType === FurniListItemParser.FLOOR_ITEM_TYPE)
		{
			this._slotId = wrapper.readString();
			this._extra = wrapper.readInt();
		}
	}

	get itemId(): number
	{
		return this._itemId;
	}

	get itemType(): string
	{
		return this._itemType;
	}

	get roomItemId(): number
	{
		return this._roomItemId;
	}

	get itemTypeId(): number
	{
		return this._itemTypeId;
	}

	get category(): number
	{
		return this._category;
	}

	get stuffData(): IStuffData | null
	{
		return this._stuffData;
	}

	get isRecyclable(): boolean
	{
		return this._isRecyclable;
	}

	get isTradeable(): boolean
	{
		return this._isTradeable;
	}

	get isGroupable(): boolean
	{
		return this._isGroupable;
	}

	get isSellable(): boolean
	{
		return this._isSellable;
	}

	get secondsToExpiration(): number
	{
		return this._secondsToExpiration;
	}

	get expirationTimeStamp(): number
	{
		return this._expirationTimeStamp;
	}

	get isRented(): boolean
	{
		return this._isRented;
	}

	get hasRentPeriodStarted(): boolean
	{
		return this._hasRentPeriodStarted;
	}

	get flatId(): number
	{
		return this._flatId;
	}

	get isWallItem(): boolean
	{
		return this._isWallItem;
	}

	get slotId(): string
	{
		return this._slotId;
	}

	get extra(): number
	{
		return this._extra;
	}

	get isExternalImageFurni(): boolean
	{
		return this._itemType.indexOf('external_image') !== -1;
	}

	/**
	 * Convert to FurnitureItemData for creating FurnitureItem
	 */
	toFurnitureItemData(): FurnitureItemData
	{
		return {
			itemId: this._itemId,
			itemType: this._itemType,
			roomItemId: this._roomItemId,
			itemTypeId: this._itemTypeId,
			category: this._category,
			stuffData: this._stuffData,
			isGroupable: this._isGroupable,
			isRecyclable: this._isRecyclable,
			isTradeable: this._isTradeable,
			isSellable: this._isSellable,
			secondsToExpiration: this._secondsToExpiration,
			flatId: this._flatId,
			slotId: this._slotId,
			songId: 0,
			extra: this._extra,
			isRented: this._isRented,
			isWallItem: this._isWallItem,
			hasRentPeriodStarted: this._hasRentPeriodStarted,
			expirationTimeStamp: this._expirationTimeStamp,
			creationDay: 0,
			creationMonth: 0,
			creationYear: 0,
			isExternalImageFurni: this.isExternalImageFurni,
		};
	}
}
