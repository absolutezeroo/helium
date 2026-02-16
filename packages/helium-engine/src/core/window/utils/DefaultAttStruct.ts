/**
 * Default attribute struct for window type+style defaults.
 *
 * Stores default blend, threshold, background, color, and optional rect limits
 * that are applied when a window of a given type+style is created.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/utils/DefaultAttStruct.as
 */
export class DefaultAttStruct
{
	public blend: number;
	public threshold: number;
	public background: boolean;
	public color: number;
	public width_min: number;
	public width_max: number;
	public height_min: number;
	public height_max: number;
	private _hasRectLimits: boolean;

	constructor(
		blend: number = 1,
		threshold: number = 10,
		background: boolean = false,
		color: number = 0xFFFFFF,
		widthMin: number = 0,
		widthMax: number = 0x7FFFFFFF,
		heightMin: number = 0,
		heightMax: number = 0x7FFFFFFF
	)
	{
		this.blend = blend;
		this.threshold = threshold;
		this.background = background;
		this.color = color;
		this.width_min = widthMin;
		this.width_max = widthMax;
		this.height_min = heightMin;
		this.height_max = heightMax;
		this._hasRectLimits = (widthMin > 0 || widthMax < 0x7FFFFFFF || heightMin > 0 || heightMax < 0x7FFFFFFF);
	}

	public hasRectLimits(): boolean
	{
		return this._hasRectLimits;
	}
}
