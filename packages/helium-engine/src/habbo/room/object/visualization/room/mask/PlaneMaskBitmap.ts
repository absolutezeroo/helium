/**
 * PlaneMaskBitmap
 *
 * @see com.sulake.habbo.room.object.visualization.room.mask.PlaneMaskBitmap
 *
 * Data object storing one bitmap mask with normalized coordinate bounds.
 */
import type {IGraphicAsset} from '@room/object/visualization/utils/IGraphicAsset';

export class PlaneMaskBitmap
{
	public static readonly MIN_NORMAL_COORDINATE_VALUE: number = -1;
	public static readonly MAX_NORMAL_COORDINATE_VALUE: number = 1;

	private _normalMinX: number;
	private _normalMaxX: number;
	private _normalMinY: number;
	private _normalMaxY: number;
	private _asset: IGraphicAsset | null;

	constructor(
		asset: IGraphicAsset,
		normalMinX: number = -1,
		normalMaxX: number = 1,
		normalMinY: number = -1,
		normalMaxY: number = 1
	)
	{
		this._asset = asset;
		this._normalMinX = normalMinX;
		this._normalMaxX = normalMaxX;
		this._normalMinY = normalMinY;
		this._normalMaxY = normalMaxY;
	}

	get asset(): IGraphicAsset | null
	{
		return this._asset;
	}

	get normalMinX(): number
	{
		return this._normalMinX;
	}

	get normalMaxX(): number
	{
		return this._normalMaxX;
	}

	get normalMinY(): number
	{
		return this._normalMinY;
	}

	get normalMaxY(): number
	{
		return this._normalMaxY;
	}

	dispose(): void
	{
		this._asset = null;
	}
}
