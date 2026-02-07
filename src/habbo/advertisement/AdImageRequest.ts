/**
 * Data object for a billboard ad image load request
 *
 * @see source_as/habbo/advertisement/AdImageRequest.as
 */
export class AdImageRequest
{
	private _roomId: number;
	private _objectId: number;
	private _objectCategory: number;
	private _imageURL: string;
	private _clickURL: string;

	constructor(roomId: number, imageURL: string = '', clickURL: string = '', objectId: number = -1, objectCategory: number = -1)
	{
		this._roomId = roomId;
		this._objectId = objectId;
		this._objectCategory = objectCategory;
		this._imageURL = imageURL;
		this._clickURL = clickURL;
	}

	get roomId(): number
	{
		return this._roomId;
	}

	get objectId(): number
	{
		return this._objectId;
	}

	get objectCategory(): number
	{
		return this._objectCategory;
	}

	get imageURL(): string
	{
		return this._imageURL;
	}

	get clickURL(): string
	{
		return this._clickURL;
	}
}
