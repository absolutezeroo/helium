import type {IWidget, IWidgetProperty} from './IWidget';

/**
 * Pixel limit display widget.
 *
 * Displays a challenge meter image based on a percentage limit value.
 * The limit value (0-100) is rounded to the nearest 20% step and
 * used to select the corresponding meter asset.
 *
 * In the AS3 version, extends IStaticBitmapWrapperWindow properties.
 * In the TypeScript port, the limit and asset URI are stored for
 * the UI layer.
 *
 * @see sources/win63_version/habbo/window/widgets/PixelLimitWidget.as
 */
export class PixelLimitWidget implements IWidget
{
	public static readonly TYPE: string = 'pixel_limit';

	private static readonly LIMIT_KEY: string = 'pixel_limit:limit';
	private _batchUpdate: boolean = false;

	constructor()
	{
	}

	private _disposed: boolean = false;

	public get disposed(): boolean
	{
		return this._disposed;
	}

	private _limit: number = 0;

	public get limit(): number
	{
		return this._limit;
	}

	public set limit(value: number)
	{
		this._limit = Math.max(0, Math.min(100, value));
	}

	/**
	 * Compute the asset URI for the current limit value.
	 */
	public get assetUri(): string
	{
		let step = Math.floor(this._limit / 20) * 20;
		step = Math.max(step, 20);

		return '${image.library.url}reception/challenge_meter_' + step.toString() + '.png';
	}

	public get properties(): IWidgetProperty[]
	{
		if (this._disposed) return [];

		return [
			{key: PixelLimitWidget.LIMIT_KEY, value: this._limit, type: 'String'},
		];
	}

	public setProperties(values: IWidgetProperty[]): void
	{
		this._batchUpdate = true;

		for (const prop of values)
		{
			if (prop.key === PixelLimitWidget.LIMIT_KEY)
			{
				this.limit = Number(prop.value);
			}
		}

		this._batchUpdate = false;
	}

	public dispose(): void
	{
		if (this._disposed) return;

		this._disposed = true;
	}
}

