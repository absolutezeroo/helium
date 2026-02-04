/**
 * RoomVisualization
 *
 * Based on AS3: com.sulake.habbo.room.object.visualization.room.RoomVisualization
 *
 * Main visualization class for room rendering. Creates and manages planes
 * (floors, walls, landscapes) from RoomPlaneParser data.
 */
import {Container} from 'pixi.js';
import type {IRoomObject} from '@room/object/IRoomObject';
import type {IRoomGeometry} from '@room/utils/IRoomGeometry';
import type {IRoomObjectSprite} from '@room/object/visualization/IRoomObjectSprite';
import type {IRoomObjectVisualizationData} from '@room/object/visualization/IRoomObjectVisualizationData';
import {RoomObjectSpriteVisualization} from '@room/object/visualization/RoomObjectSpriteVisualization';
import {RoomObjectSpriteType} from '@room/object/enum/RoomObjectSpriteType';
import {RoomPlane} from './RoomPlane';
import {Vector3d} from '@room/utils/Vector3d';
import type {IVector3d} from '@room/utils/IVector3d';
import {RoomPlaneData} from '@habbo/room/object/RoomPlaneData';

export class RoomVisualization extends RoomObjectSpriteVisualization
{
	// Floor colors (AS3 constants)
	public static readonly FLOOR_COLOR_TOP: number = 0x989865;
	public static readonly FLOOR_COLOR_LEFT: number = 0x838357;
	public static readonly FLOOR_COLOR_RIGHT: number = 0x666644;

	// Wall colors (AS3 constants)
	public static readonly WALL_COLOR_TOP: number = 0xB6B6C8;
	public static readonly WALL_COLOR_SIDE: number = 0x9696A8;
	public static readonly WALL_COLOR_BOTTOM: number = 0x7C7C8C;
	public static readonly WALL_COLOR_BORDER: number = 0x999999;

	// Landscape colors
	public static readonly LANDSCAPE_COLOR_TOP: number = 0xFFFFFF;
	public static readonly LANDSCAPE_COLOR_SIDE: number = 0xCCCCCC;
	public static readonly LANDSCAPE_COLOR_BOTTOM: number = 0x999999;

	private static readonly ROOM_DEPTH_OFFSET: number = 1000;
	private static readonly UPDATE_INTERVAL: number = 250;

	private _planes: RoomPlane[] = [];
	private _planeIndexMap: Map<number, number> = new Map();
	private _initialized: boolean = false;
	private _visiblePlanes: RoomPlane[] = [];
	private _visiblePlaneSpriteNumbers: number[] = [];
	private _planeTypeVisibility: boolean[] = [];

	private _floorType: string | null = null;
	private _wallType: string | null = null;
	private _landscapeType: string | null = null;

	private _floorThickness: number = NaN;
	private _wallThickness: number = NaN;

	private _backgroundColor: number = 0xFFFFFF;
	private _backgroundRed: number = 255;
	private _backgroundGreen: number = 255;
	private _backgroundBlue: number = 255;

	private _updateCount: number = 0;
	private _lastUpdateTime: number = -1000;
	private _geometryUpdateId: number = -1;

	private _geometryDirX: number = 0;
	private _geometryDirY: number = 0;
	private _geometryDirZ: number = 0;
	private _geometryScale: number = 0;

	private _planeContainer: Container;

	constructor()
	{
		super();

		this._planeTypeVisibility[0] = false;
		this._planeTypeVisibility[RoomPlane.TYPE_WALL] = true;
		this._planeTypeVisibility[RoomPlane.TYPE_FLOOR] = true;
		this._planeTypeVisibility[RoomPlane.TYPE_LANDSCAPE] = true;

		this._planeContainer = new Container();
		this._planeContainer.label = 'RoomVisualization_Planes';
		this.container.addChild(this._planeContainer);
	}

	override dispose(): void
	{
		this.resetRoomPlanes();
		this._planes = [];
		this._planeIndexMap.clear();
		this._visiblePlanes = [];
		this._visiblePlaneSpriteNumbers = [];

		this._planeContainer.destroy({children: true});

		super.dispose();
	}

	protected override reset(): void
	{
		super.reset();
		this._floorType = null;
		this._wallType = null;
		this._landscapeType = null;
		this._geometryUpdateId = -1;
		this._geometryScale = 0;
	}

	override initialize(data: IRoomObjectVisualizationData): boolean
	{
		this.reset();
		return true;
	}

	get floorRelativeDepth(): number
	{
		return RoomVisualization.ROOM_DEPTH_OFFSET + 0.1;
	}

	get wallRelativeDepth(): number
	{
		return RoomVisualization.ROOM_DEPTH_OFFSET + 0.5;
	}

	get planeCount(): number
	{
		return this._planes.length;
	}

	override update(geometry: IRoomGeometry, time: number, update: boolean, skipUpdate: boolean): void
	{
		const roomObject = this.object;

		if (roomObject === null)
		{
			return;
		}

		if (geometry === null)
		{
			return;
		}

		const geometryUpdated = this.updateGeometry(geometry);
		const model = roomObject.getModel();

		this.initializeRoomPlanes();

		let needsUpdate = false;

		// Check if enough time has passed for an update
		if (time < this._lastUpdateTime + RoomVisualization.UPDATE_INTERVAL && !geometryUpdated)
		{
			return;
		}

		// Update planes
		if (this.updatePlanes(geometry, geometryUpdated, time))
		{
			needsUpdate = true;
		}

		if (needsUpdate)
		{
			// Apply background color to planes
			for (let i = 0; i < this._visiblePlanes.length; i++)
			{
				const spriteNumber = this._visiblePlaneSpriteNumbers[i];
				const sprite = this.getSprite(spriteNumber);
				const plane = this._visiblePlanes[i];

				if (sprite !== null && plane !== null && plane.type !== RoomPlane.TYPE_LANDSCAPE)
				{
					let color = plane.color;

					// Apply background color tinting
					const blue = (color & 0xFF) * this._backgroundBlue / 255;
					const green = ((color >> 8) & 0xFF) * this._backgroundGreen / 255;
					const red = ((color >> 16) & 0xFF) * this._backgroundRed / 255;
					const alpha = (color >> 24) & 0xFF;

					color = (alpha << 24) + (red << 16) + (green << 8) + blue;
					sprite.color = color;
				}
			}

			this.increaseUpdateId();
		}

		this._updateModelCounter = model?.getUpdateID() ?? 0;
		this._lastUpdateTime = time;
	}

	protected initializeRoomPlanes(): void
	{
		if (this._initialized)
		{
			return;
		}

		const roomObject = this.object;

		if (roomObject === null)
		{
			return;
		}

		const model = roomObject.getModel();

		if (model === null)
		{
			return;
		}

		// Get plane data from room model
		const planeCount = model.getNumber('room_plane_count');

		if (isNaN(planeCount) || planeCount <= 0)
		{
			return;
		}

		this.createPlanesAndSprites(planeCount, model, roomObject);
	}

	private createPlanesAndSprites(planeCount: number, model: unknown, roomObject: IRoomObject): void
	{
		const modelAccessor = model as {getNumber(key: string): number};

		for (let i = 0; i < planeCount; i++)
		{
			const type = modelAccessor.getNumber(`plane_${i}_type`);
			const locX = modelAccessor.getNumber(`plane_${i}_loc_x`);
			const locY = modelAccessor.getNumber(`plane_${i}_loc_y`);
			const locZ = modelAccessor.getNumber(`plane_${i}_loc_z`);
			const leftX = modelAccessor.getNumber(`plane_${i}_left_x`);
			const leftY = modelAccessor.getNumber(`plane_${i}_left_y`);
			const leftZ = modelAccessor.getNumber(`plane_${i}_left_z`);
			const rightX = modelAccessor.getNumber(`plane_${i}_right_x`);
			const rightY = modelAccessor.getNumber(`plane_${i}_right_y`);
			const rightZ = modelAccessor.getNumber(`plane_${i}_right_z`);

			// Skip if data is missing
			if (isNaN(locX) || isNaN(locY) || isNaN(locZ))
			{
				continue;
			}

			const location = new Vector3d(locX, locY, locZ);
			const leftSide = new Vector3d(leftX, leftY, leftZ);
			const rightSide = new Vector3d(rightX, rightY, rightZ);
			const origin = roomObject.getLocation();

			const normal = Vector3d.crossProduct(leftSide, rightSide);
			const secondaryNormals: IVector3d[] = [];

			// Determine plane type and color
			let planeType: number;
			let color: number;

			if (type === RoomPlaneData.PLANE_FLOOR)
			{
				planeType = RoomPlane.TYPE_FLOOR;

				// Determine floor color based on normal
				if (normal !== null && normal.z !== 0)
				{
					color = RoomVisualization.FLOOR_COLOR_TOP;
				}
				else if (normal !== null && normal.x !== 0)
				{
					color = RoomVisualization.FLOOR_COLOR_RIGHT;
				}
				else
				{
					color = RoomVisualization.FLOOR_COLOR_LEFT;
				}
			}
			else if (type === RoomPlaneData.PLANE_WALL)
			{
				planeType = RoomPlane.TYPE_WALL;

				// Determine wall color based on normal
				if (normal !== null && normal.x === 0 && normal.y === 0)
				{
					color = RoomVisualization.WALL_COLOR_BOTTOM;
				}
				else if (normal !== null && normal.y > 0)
				{
					color = RoomVisualization.WALL_COLOR_TOP;
				}
				else if (normal !== null && normal.y === 0)
				{
					color = RoomVisualization.WALL_COLOR_SIDE;
				}
				else
				{
					color = RoomVisualization.WALL_COLOR_BOTTOM;
				}
			}
			else if (type === RoomPlaneData.PLANE_LANDSCAPE)
			{
				planeType = RoomPlane.TYPE_LANDSCAPE;

				if (normal !== null && normal.y > 0)
				{
					color = RoomVisualization.LANDSCAPE_COLOR_TOP;
				}
				else if (normal !== null && normal.y === 0)
				{
					color = RoomVisualization.LANDSCAPE_COLOR_SIDE;
				}
				else
				{
					color = RoomVisualization.LANDSCAPE_COLOR_BOTTOM;
				}
			}
			else
			{
				continue;
			}

			const randomSeed = Math.floor(Math.random() * 10000);

			const plane = new RoomPlane(
				origin,
				location,
				leftSide,
				rightSide,
				planeType,
				true,
				secondaryNormals.length > 0 ? secondaryNormals : null,
				randomSeed
			);

			plane.color = color;

			this._planeIndexMap.set(i, this._planes.length);
			this._planes.push(plane);

			// Add the plane's graphics to the container
			this._planeContainer.addChild(plane.graphics);
		}

		this._initialized = true;
		this.defineSprites();
	}

	protected defineSprites(startIndex: number = 0): void
	{
		const count = this._planes.length;
		this.createSprites(count);

		for (let i = startIndex; i < count; i++)
		{
			const plane = this._planes[i];
			const sprite = this.getSprite(i);

			if (sprite !== null && plane !== null && plane.leftSide !== null && plane.rightSide !== null)
			{
				if (plane.type === RoomPlane.TYPE_WALL && (plane.leftSide.length < 1 || plane.rightSide.length < 1))
				{
					sprite.alphaTolerance = 256;
				}
				else
				{
					sprite.alphaTolerance = 128;
				}

				if (plane.type === RoomPlane.TYPE_WALL)
				{
					sprite.tag = `plane.wall@${i + 1}`;
				}
				else if (plane.type === RoomPlane.TYPE_FLOOR)
				{
					sprite.tag = `plane.floor@${i + 1}`;
				}
				else
				{
					sprite.tag = `plane@${i + 1}`;
				}

				sprite.spriteType = RoomObjectSpriteType.ROOM_PLANE;
			}
		}
	}

	protected updatePlanes(geometry: IRoomGeometry, geometryUpdated: boolean, time: number): boolean
	{
		const roomObject = this.object;

		if (roomObject === null)
		{
			return false;
		}

		if (geometry === null)
		{
			return false;
		}

		this._updateCount++;

		if (geometryUpdated)
		{
			this._visiblePlanes = [];
			this._visiblePlaneSpriteNumbers = [];
		}

		let updated = false;
		const visiblePlanesSet = this._visiblePlanes.length > 0;
		const planesToCheck = visiblePlanesSet ? this._visiblePlanes : this._planes;

		for (let i = 0; i < planesToCheck.length; i++)
		{
			let spriteIndex = i;

			if (visiblePlanesSet)
			{
				spriteIndex = this._visiblePlaneSpriteNumbers[i];
			}

			const sprite = this.getSprite(spriteIndex);

			if (sprite !== null)
			{
				const plane = planesToCheck[i];

				if (plane !== null)
				{
					sprite.planeId = plane.uniqueId;

					if (plane.update(geometry, time))
					{
						if (plane.visible)
						{
							let depth = plane.relativeDepth + this.floorRelativeDepth + spriteIndex / 1000;

							if (plane.type !== RoomPlane.TYPE_FLOOR)
							{
								depth = plane.relativeDepth + this.wallRelativeDepth + spriteIndex / 1000;

								if (plane.leftSide.length < 1 || plane.rightSide.length < 1)
								{
									depth += RoomVisualization.ROOM_DEPTH_OFFSET * 0.5;
								}
							}

							this.updateSprite(sprite, plane, `plane ${spriteIndex} ${geometry.scale}`, depth);
						}

						updated = true;
					}

					const visibility = plane.visible && this._planeTypeVisibility[plane.type];

					if (sprite.visible !== visibility)
					{
						sprite.visible = visibility;
						updated = true;
					}

					if (sprite.visible && !visiblePlanesSet)
					{
						this._visiblePlanes.push(plane);
						this._visiblePlaneSpriteNumbers.push(i);
					}
				}
				else
				{
					sprite.planeId = 0;

					if (sprite.visible)
					{
						sprite.visible = false;
						updated = true;
					}
				}
			}
		}

		return updated;
	}

	private updateSprite(sprite: IRoomObjectSprite, plane: RoomPlane, name: string, depth: number): void
	{
		const offset = plane.offset;

		sprite.offsetX = -offset.x;
		sprite.offsetY = -offset.y;
		sprite.relativeDepth = depth;
		sprite.color = plane.color;
		sprite.assetName = `${name}_${this._updateCount}`;
	}

	private updateGeometry(geometry: IRoomGeometry): boolean
	{
		if (geometry.updateId !== this._geometryUpdateId)
		{
			this._geometryUpdateId = geometry.updateId;

			const direction = geometry.direction;

			if (direction !== null &&
				(direction.x !== this._geometryDirX ||
				 direction.y !== this._geometryDirY ||
				 direction.z !== this._geometryDirZ ||
				 geometry.scale !== this._geometryScale))
			{
				this._geometryDirX = direction.x;
				this._geometryDirY = direction.y;
				this._geometryDirZ = direction.z;
				this._geometryScale = geometry.scale;

				return true;
			}
		}

		return false;
	}

	private resetRoomPlanes(): void
	{
		for (const plane of this._planes)
		{
			if (plane !== null)
			{
				plane.dispose();
			}
		}

		this._planes = [];
		this._planeIndexMap.clear();
		this._initialized = false;
		this._updateCount++;
		this.reset();
	}
}
