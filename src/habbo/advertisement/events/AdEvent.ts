/**
 * Event for room ad image loading
 *
 * @see source_as/habbo/advertisement/events/AdEvent.as
 */
export class AdEvent
{
	static readonly ROOM_AD_IMAGE_LOADED = 'AE_ROOM_AD_IMAGE_LOADED';
	static readonly ROOM_AD_IMAGE_LOADING_FAILED = 'AE_ROOM_AD_IMAGE_LOADING_FAILED';
	static readonly ROOM_AD_SHOW = 'AE_ROOM_AD_SHOW';

	private _type: string;
	private _roomId: number;
	private _imageUrl: string;
	private _clickUrl: string;
	private _objectId: number;
	private _objectCategory: number;

	constructor(
		type: string,
		roomId: number,
		imageUrl: string = '',
		clickUrl: string = '',
		objectId: number = -1,
		objectCategory: number = -1
	)
	{
		this._type = type;
		this._roomId = roomId;
		this._imageUrl = imageUrl;
		this._clickUrl = clickUrl;
		this._objectId = objectId;
		this._objectCategory = objectCategory;
	}

	get type(): string
	{
		return this._type;
	}

	get roomId(): number
	{
		return this._roomId;
	}

	get imageUrl(): string
	{
		return this._imageUrl;
	}

	get clickUrl(): string
	{
		return this._clickUrl;
	}

	get objectId(): number
	{
		return this._objectId;
	}

	get objectCategory(): number
	{
		return this._objectCategory;
	}
}
