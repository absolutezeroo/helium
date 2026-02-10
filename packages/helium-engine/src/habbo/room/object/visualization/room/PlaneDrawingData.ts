/**
 * PlaneDrawingData
 *
 * @see com.sulake.habbo.room.object.visualization.room.PlaneDrawingData
 *
 * Data object for plane drawing info - stores corner points, mask references,
 * color, z-depth, and asset columns.
 */
export class PlaneDrawingData
{
	private _z: number = 0;
	private _cornerPoints: { x: number; y: number }[] | null = null;
	private _maskAssetNames: string[];
	private _maskAssetLocations: { x: number; y: number }[];
	private _maskAssetFlipHs: boolean[];
	private _maskAssetFlipVs: boolean[];
	private _assetNameColumns: string[][];
	private _color: number;
	private _bottomAligned: boolean;

	constructor(source: PlaneDrawingData | null = null, color: number = 0, bottomAligned: boolean = false)
	{
		this._assetNameColumns = [];

		if (source !== null)
		{
			this._maskAssetNames = [...source._maskAssetNames];
			this._maskAssetLocations = [...source._maskAssetLocations];
			this._maskAssetFlipHs = [...source._maskAssetFlipHs];
			this._maskAssetFlipVs = [...source._maskAssetFlipVs];
		}
		else
		{
			this._maskAssetNames = [];
			this._maskAssetLocations = [];
			this._maskAssetFlipHs = [];
			this._maskAssetFlipVs = [];
		}

		this._color = color;
		this._bottomAligned = bottomAligned;
	}

	get color(): number
	{
		return this._color;
	}

	get z(): number
	{
		return this._z;
	}

	set z(value: number)
	{
		this._z = value;
	}

	get cornerPoints(): { x: number; y: number }[] | null
	{
		return this._cornerPoints;
	}

	set cornerPoints(value: { x: number; y: number }[] | null)
	{
		this._cornerPoints = value;
	}

	get maskAssetNames(): string[]
	{
		return this._maskAssetNames;
	}

	get maskAssetLocations(): { x: number; y: number }[]
	{
		return this._maskAssetLocations;
	}

	get maskAssetFlipHs(): boolean[]
	{
		return this._maskAssetFlipHs;
	}

	get maskAssetFlipVs(): boolean[]
	{
		return this._maskAssetFlipVs;
	}

	get assetNameColumns(): string[][]
	{
		return this._assetNameColumns;
	}

	addMask(name: string, location: { x: number; y: number }, flipH: boolean, flipV: boolean): void
	{
		this._maskAssetNames.push(name);
		this._maskAssetLocations.push(location);
		this._maskAssetFlipHs.push(flipH);
		this._maskAssetFlipVs.push(flipV);
	}

	addAssetColumn(column: string[]): void
	{
		this._assetNameColumns.push(column);
	}

	isBottomAligned(): boolean
	{
		return this._bottomAligned;
	}
}
