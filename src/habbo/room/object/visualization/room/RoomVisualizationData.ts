/**
 * RoomVisualizationData
 *
 * Based on AS3: com.sulake.habbo.room.object.visualization.room.RoomVisualizationData
 *
 * Manages all rasterizers (floor, wall) and initializes them from bundle data.
 */
import type {IRoomObjectVisualizationData} from '@room/object/visualization/IRoomObjectVisualizationData';
import type {IPlaneRasterizer} from './rasterizer/IPlaneRasterizer';
import {FloorRasterizer} from './rasterizer/basic/FloorRasterizer';
import {WallRasterizer} from './rasterizer/basic/WallRasterizer';
import type {IAssetRoomVisualizationData} from './rasterizer/basic/PlaneRasterizerTypes';

export class RoomVisualizationData implements IRoomObjectVisualizationData
{
	private _floorRasterizer: FloorRasterizer;
	private _wallRasterizer: WallRasterizer;
	private _initialized: boolean = false;
	private _disposed: boolean = false;

	constructor()
	{
		this._floorRasterizer = new FloorRasterizer();
		this._wallRasterizer = new WallRasterizer();
	}

	get disposed(): boolean
	{
		return this._disposed;
	}

	get floorRasterizer(): IPlaneRasterizer
	{
		return this._floorRasterizer;
	}

	get wallRasterizer(): IPlaneRasterizer
	{
		return this._wallRasterizer;
	}

	get initialized(): boolean
	{
		return this._initialized;
	}

	initialize(data: unknown): boolean
	{
		this.reset();

		if (data === null || data === undefined) return false;

		const vizData = data as IAssetRoomVisualizationData;

		if (vizData.floorData)
		{
			this._floorRasterizer.initialize(vizData.floorData);
		}

		if (vizData.wallData)
		{
			this._wallRasterizer.initialize(vizData.wallData);
		}

		return true;
	}

	initializeAssetCollection(textures: Map<string, HTMLCanvasElement>): void
	{
		if (this._initialized) return;

		this._floorRasterizer.initializeAssetCollection(textures);
		this._wallRasterizer.initializeAssetCollection(textures);

		this._initialized = true;
	}

	clearCache(): void
	{
		this._floorRasterizer.clearCache();
		this._wallRasterizer.clearCache();
	}

	dispose(): void
	{
		if (this._disposed) return;
		this._floorRasterizer.dispose();
		this._wallRasterizer.dispose();
		this._disposed = true;
	}

	protected reset(): void
	{
		// Override in subclasses if needed
	}
}
