/**
 * GraphicAsset
 *
 * @see com.sulake.room.object.visualization.utils.GraphicAsset
 *
 * Concrete implementation of IGraphicAsset with object pooling.
 * Wraps a PixiJS Texture with flip/offset metadata.
 */
import type {Texture} from 'pixi.js';
import type {IGraphicAsset} from './IGraphicAsset';

export class GraphicAsset implements IGraphicAsset
{
	private static _pool: GraphicAsset[] = [];

	private _assetName: string = '';
	private _libraryAssetName: string = '';
	private _texture: Texture | null = null;
	private _flipH: boolean = false;
	private _flipV: boolean = false;
	private _usesPalette: boolean = false;
	private _offsetX: number = 0;
	private _offsetY: number = 0;
	private _width: number = 0;
	private _height: number = 0;
	private _initialized: boolean = false;

	/**
	 * Allocate a GraphicAsset from the object pool or create a new one.
	 */
	static allocate(
		assetName: string,
		libraryAssetName: string,
		texture: Texture | null,
		flipH: boolean,
		flipV: boolean,
		offsetX: number,
		offsetY: number,
		usesPalette: boolean = false
	): GraphicAsset
	{
		const asset = GraphicAsset._pool.length > 0
			? GraphicAsset._pool.pop()!
			: new GraphicAsset();

		asset._assetName = assetName;
		asset._libraryAssetName = libraryAssetName;

		if (texture !== null)
		{
			asset._texture = texture;
			asset._initialized = false;
		}
		else
		{
			asset._texture = null;
			asset._initialized = true;
		}

		asset._flipH = flipH;
		asset._flipV = flipV;
		asset._offsetX = offsetX;
		asset._offsetY = offsetY;
		asset._usesPalette = usesPalette;

		return asset;
	}

	get flipH(): boolean
	{
		return this._flipH;
	}

	get flipV(): boolean
	{
		return this._flipV;
	}

	get width(): number
	{
		this.initialize();
		return this._width;
	}

	get height(): number
	{
		this.initialize();
		return this._height;
	}

	get assetName(): string
	{
		return this._assetName;
	}

	get libraryAssetName(): string
	{
		return this._libraryAssetName;
	}

	get texture(): Texture | null
	{
		return this._texture;
	}

	get usesPalette(): boolean
	{
		return this._usesPalette;
	}

	get offsetX(): number
	{
		if (!this._flipH)
		{
			return this._offsetX;
		}

		return -(this.width + this._offsetX);
	}

	get offsetY(): number
	{
		if (!this._flipV)
		{
			return this._offsetY;
		}

		return -(this.height + this._offsetY);
	}

	get originalOffsetX(): number
	{
		return this._offsetX;
	}

	get originalOffsetY(): number
	{
		return this._offsetY;
	}

	recycle(): void
	{
		this._texture = null;
		GraphicAsset._pool.push(this);
	}

	private initialize(): void
	{
		if (!this._initialized && this._texture !== null)
		{
			this._width = this._texture.width;
			this._height = this._texture.height;
			this._initialized = true;
		}
	}
}
