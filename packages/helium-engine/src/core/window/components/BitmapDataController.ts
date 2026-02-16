import type {IWindow} from '../IWindow';
import type {IWindowContext} from '../IWindowContext';
import {WindowController} from '../WindowController';
import {WindowEvent} from '../events/WindowEvent';

/**
 * Controller for bitmap data windows.
 *
 * Base class for bitmap-based window types. Manages a single ImageBitmap
 * with pivot, stretch, zoom, wrap, and greyscale properties.
 *
 * In AS3, this extended WindowController and implemented IBitmapDataContainer.
 * Flash rendered the Bitmap automatically; here we draw it explicitly during
 * compositing.
 *
 * @see sources/win63_version/core/window/components/BitmapDataController.as
 * @see sources/flash_version/com/sulake/core/window/components/BitmapDataController.as
 */
export class BitmapDataController extends WindowController
{
	private _pivot: number = 0;

	constructor(
		name: string,
		type: number,
		style: number,
		param: number,
		context: IWindowContext,
		rect: { x: number; y: number; width: number; height: number },
		parent: IWindow | null = null,
		procedure: ((event: WindowEvent, window: IWindow) => void) | null = null,
		tags: string[] | null = null,
		properties: unknown[] | null = null,
		id: number = 0,
		dynamicStyle: string = ''
	)
	{
		super(name, type, style, param, context, rect, parent, procedure, tags, properties, id, dynamicStyle);

		this._hasVisualContent = true;
	}

	protected _bitmapData: ImageBitmap | null = null;

	/**
	 * The bitmap data for this window.
	 *
	 * In AS3: `BitmapDataController._bitmapData` (BitmapData).
	 */
	public get bitmapData(): ImageBitmap | null
	{
		return this._bitmapData;
	}

	public set bitmapData(value: ImageBitmap | null)
	{
		this._bitmapData = value;
	}

	private _stretchedX: boolean = false;

	/**
	 * Whether the bitmap is stretched horizontally.
	 */
	public get stretchedX(): boolean
	{
		return this._stretchedX;
	}

	public set stretchedX(value: boolean)
	{
		this._stretchedX = value;
	}

	private _stretchedY: boolean = false;

	/**
	 * Whether the bitmap is stretched vertically.
	 */
	public get stretchedY(): boolean
	{
		return this._stretchedY;
	}

	public set stretchedY(value: boolean)
	{
		this._stretchedY = value;
	}

	private _zoomX: number = 1.0;

	/**
	 * Horizontal zoom factor.
	 */
	public get zoomX(): number
	{
		return this._zoomX;
	}

	public set zoomX(value: number)
	{
		this._zoomX = value;
	}

	private _zoomY: number = 1.0;

	/**
	 * Vertical zoom factor.
	 */
	public get zoomY(): number
	{
		return this._zoomY;
	}

	public set zoomY(value: number)
	{
		this._zoomY = value;
	}

	private _fitSizeToContents: boolean = true;

	/**
	 * Whether to auto-resize the window to fit the bitmap dimensions.
	 */
	public get fitSizeToContents(): boolean
	{
		return this._fitSizeToContents;
	}

	public set fitSizeToContents(value: boolean)
	{
		this._fitSizeToContents = value;
	}

	private _greyscale: boolean = false;

	/**
	 * Whether the bitmap is rendered in greyscale.
	 */
	public get greyscale(): boolean
	{
		return this._greyscale;
	}

	public set greyscale(value: boolean)
	{
		this._greyscale = value;
	}

	private _wrapX: boolean = false;

	/**
	 * Whether the bitmap wraps horizontally.
	 */
	public get wrapX(): boolean
	{
		return this._wrapX;
	}

	public set wrapX(value: boolean)
	{
		this._wrapX = value;
	}

	private _wrapY: boolean = false;

	/**
	 * Whether the bitmap wraps vertically.
	 */
	public get wrapY(): boolean
	{
		return this._wrapY;
	}

	public set wrapY(value: boolean)
	{
		this._wrapY = value;
	}

	/**
	 * The pivot point for bitmap rendering.
	 *
	 * In AS3: `pivotPoint` (uint, PivotPoint enum).
	 */
	public get pivotPoint(): number
	{
		return this._pivot;
	}

	public set pivotPoint(value: number)
	{
		this._pivot = value;
	}

	public override dispose(): void
	{
		if (this._disposed) return;

		this._bitmapData = null;

		super.dispose();
	}

	/**
	 * Resizes the window to match the bitmap dimensions (scaled by zoom).
	 *
	 * In AS3: `fitSize()` — if `_fitSizeToContents && _bitmapData`, sets
	 * width/height to `Math.abs(bitmapData.width * zoomX)` / `Math.abs(bitmapData.height * zoomY)`.
	 */
	protected fitSize(): void
	{
		if (!this._fitSizeToContents || !this._bitmapData) return;

		this.width = Math.abs(this._bitmapData.width * this._zoomX);
		this.height = Math.abs(this._bitmapData.height * this._zoomY);
	}
}
