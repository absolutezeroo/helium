/**
 * Badge image info holder
 * @see source_as_win63/habbo/session/BadgeInfo.as
 */
export class BadgeInfo
{
	private _image: HTMLImageElement | null;
	private _placeHolder: boolean;

	constructor(image: HTMLImageElement | null, placeHolder: boolean)
	{
		this._image = image;
		this._placeHolder = placeHolder;
	}

	get image(): HTMLImageElement | null
	{
		return this._image;
	}

	get placeHolder(): boolean
	{
		return this._placeHolder;
	}
}
