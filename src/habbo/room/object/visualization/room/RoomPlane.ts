/**
 * RoomPlane
 *
 * Based on AS3: com.sulake.habbo.room.object.visualization.room.RoomPlane
 *
 * Handles rendering of individual room planes (floor tiles, walls, landscape).
 * Calculates screen positions from 3D coordinates and renders using PixiJS Graphics.
 */
import {Graphics} from 'pixi.js';
import {Vector3d} from '@room/utils/Vector3d';
import type {IVector3d} from '@room/utils/IVector3d';
import type {IRoomGeometry} from '@room/utils/IRoomGeometry';

let planeUniqueIdCounter = 1;

export class RoomPlane
{
	public static readonly TYPE_UNDEFINED: number = 0;
	public static readonly TYPE_WALL: number = 1;
	public static readonly TYPE_FLOOR: number = 2;
	public static readonly TYPE_LANDSCAPE: number = 3;

	private _randomSeed: number = 0;
	private _origin: Vector3d;
	private _secondaryNormals: Vector3d[] = [];
	private _geometryUpdateId: number = -1;
	private _isVisible: boolean = false;
	private _textureOffsetU: number = 0;
	private _textureOffsetV: number = 0;
	private _textureMaxU: number = 0;
	private _textureMaxV: number = 0;
	private _useMask: boolean = false;
	private _cornerA: Vector3d;
	private _cornerB: Vector3d;
	private _cornerC: Vector3d;
	private _cornerD: Vector3d;
	private _width: number = 0;
	private _height: number = 0;

	constructor(
		origin: IVector3d,
		location: IVector3d,
		leftSide: IVector3d,
		rightSide: IVector3d,
		type: number,
		useMask: boolean,
		secondaryNormals: IVector3d[] | null,
		randomSeed: number,
		textureOffsetU: number = 0,
		textureOffsetV: number = 0,
		textureMaxU: number = 0,
		textureMaxV: number = 0
	)
	{
		this._randomSeed = randomSeed;
		this._uniqueId = planeUniqueIdCounter++;

		this._origin = new Vector3d();
		this._origin.assign(origin);

		this._location = new Vector3d();
		this._location.assign(location);

		this._leftSide = new Vector3d();
		this._leftSide.assign(leftSide);

		this._rightSide = new Vector3d();
		this._rightSide.assign(rightSide);

		this._normal = Vector3d.crossProduct(leftSide, rightSide)!;
		if (this._normal.length > 0)
		{
			this._normal.mul(1 / this._normal.length);
		}

		if (secondaryNormals !== null)
		{
			for (const normal of secondaryNormals)
			{
				if (normal !== null)
				{
					const vec = new Vector3d();
					vec.assign(normal);
					this._secondaryNormals.push(vec);
				}
			}
		}

		this._type = type;
		this._useMask = useMask;
		this._textureOffsetU = textureOffsetU;
		this._textureOffsetV = textureOffsetV;
		this._textureMaxU = textureMaxU;
		this._textureMaxV = textureMaxV;

		this._cornerA = new Vector3d();
		this._cornerB = new Vector3d();
		this._cornerC = new Vector3d();
		this._cornerD = new Vector3d();

		this._graphics = new Graphics();
		this._graphics.label = `RoomPlane_${this._uniqueId}_type${type}`;
	}

	private _disposed: boolean = false;

	get disposed(): boolean
	{
		return this._disposed;
	}

	private _location: Vector3d;

	get location(): IVector3d
	{
		return this._location;
	}

	private _leftSide: Vector3d;

	get leftSide(): IVector3d
	{
		return this._leftSide;
	}

	private _rightSide: Vector3d;

	get rightSide(): IVector3d
	{
		return this._rightSide;
	}

	private _normal: Vector3d;

	get normal(): IVector3d
	{
		return this._normal;
	}

	private _type: number = 0;

	get type(): number
	{
		return this._type;
	}

	private _canBeVisible: boolean = true;

	get canBeVisible(): boolean
	{
		return this._canBeVisible;
	}

	set canBeVisible(value: boolean)
	{
		this._canBeVisible = value;
	}

	private _hasTexture: boolean = true;

	get hasTexture(): boolean
	{
		return this._hasTexture;
	}

	set hasTexture(value: boolean)
	{
		this._hasTexture = value;
	}

	private _id: string | null = null;

	set id(value: string)
	{
		this._id = value;
	}

	private _uniqueId: number;

	get uniqueId(): number
	{
		return this._uniqueId;
	}

	private _offset: { x: number; y: number } = {x: 0, y: 0};

	get offset(): { x: number; y: number }
	{
		return this._offset;
	}

	private _relativeDepth: number = 0;

	get relativeDepth(): number
	{
		return this._relativeDepth + this._extraDepth;
	}

	private _color: number = 0;

	get color(): number
	{
		return this._color;
	}

	set color(value: number)
	{
		this._color = value;
	}

	private _extraDepth: number = 0;

	set extraDepth(value: number)
	{
		this._extraDepth = value;
	}

	private _graphics: Graphics;

	get graphics(): Graphics
	{
		return this._graphics;
	}

	private _isHighlighter: boolean = false;

	get isHighlighter(): boolean
	{
		return this._isHighlighter;
	}

	set isHighlighter(value: boolean)
	{
		this._isHighlighter = value;
	}

	get visible(): boolean
	{
		return this._isVisible && this._canBeVisible;
	}

	dispose(): void
	{
		if (this._disposed)
		{
			return;
		}

		this._graphics.destroy();
		this._disposed = true;
	}

	/**
	 * Update the plane based on room geometry
	 */
	update(geometry: IRoomGeometry, time: number): boolean
	{
		if (geometry === null || this._disposed)
		{
			return false;
		}

		let needsUpdate = false;

		if (this._geometryUpdateId !== geometry.updateId)
		{
			needsUpdate = true;
		}

		if (!needsUpdate || !this._canBeVisible)
		{
			if (!this.visible)
			{
				return false;
			}
		}

		if (needsUpdate)
		{
			// Check visibility using normal and direction axis (AS3: lines 383-400)
			const cosAngle = Vector3d.cosAngle(geometry.directionAxis as Vector3d, this._normal);

			if (cosAngle > -0.001)
			{
				if (this._isVisible)
				{
					this._isVisible = false;
					return true;
				}
				return false;
			}

			// Check secondary normals
			for (const secondaryNormal of this._secondaryNormals)
			{
				const secondaryCos = Vector3d.cosAngle(geometry.directionAxis as Vector3d, secondaryNormal);

				if (secondaryCos > -0.001)
				{
					if (this._isVisible)
					{
						this._isVisible = false;
						return true;
					}
					return false;
				}
			}

			// Update corner positions (transforms to local space)
			this.updateCorners(geometry);

			// Calculate depth (AS3: lines 404-412)
			const originScreen = geometry.getScreenPosition(this._origin);
			const originZ = originScreen !== null ? originScreen.z : 0;

			const maxZ = Math.max(
				this._cornerA.z,
				this._cornerB.z,
				this._cornerC.z,
				this._cornerD.z
			) - originZ;

			let depth = maxZ;

			if (this._type === RoomPlane.TYPE_FLOOR)
			{
				depth -= (this._location.z + Math.min(0, this._leftSide.z, this._rightSide.z)) * 8;
			}

			if (this._type === RoomPlane.TYPE_LANDSCAPE)
			{
				depth += 0.02;
			}

			this._relativeDepth = depth;
			this._isVisible = true;
			this._geometryUpdateId = geometry.updateId;
		}

		// Render the plane
		this.render(geometry);

		return true;
	}

	resetBitmapMasks(): void
	{
		// TODO: Implement mask handling
	}

	addBitmapMask(type: string, leftSideLoc: number, rightSideLoc: number): boolean
	{
		// TODO: Implement mask handling
		return false;
	}

	addRectangleMask(leftSideLoc: number, rightSideLoc: number, leftSideLength: number, rightSideLength: number): boolean
	{
		// TODO: Implement mask handling
		return false;
	}

	private updateCorners(geometry: IRoomGeometry): void
	{
		// Calculate corner positions in screen space (AS3: lines 673-676)
		const aPos = geometry.getScreenPosition(this._location);
		const bPos = geometry.getScreenPosition(Vector3d.sum(this._location, this._rightSide)!);
		const cPos = geometry.getScreenPosition(Vector3d.sum(Vector3d.sum(this._location, this._leftSide)!, this._rightSide)!);
		const dPos = geometry.getScreenPosition(Vector3d.sum(this._location, this._leftSide)!);

		if (aPos !== null) this._cornerA.assign(aPos);
		if (bPos !== null) this._cornerB.assign(bPos);
		if (cPos !== null) this._cornerC.assign(cPos);
		if (dPos !== null) this._cornerD.assign(dPos);

		// Calculate offset from room origin (AS3: line 677)
		const offsetPoint = geometry.getScreenPoint(this._origin);
		if (offsetPoint !== null)
		{
			this._offset.x = Math.round(offsetPoint.x);
			this._offset.y = Math.round(offsetPoint.y);
		}

		// Round corner positions (AS3: lines 678-687)
		this._cornerA.x = Math.round(this._cornerA.x);
		this._cornerA.y = Math.round(this._cornerA.y);
		this._cornerB.x = Math.round(this._cornerB.x);
		this._cornerB.y = Math.round(this._cornerB.y);
		this._cornerC.x = Math.round(this._cornerC.x);
		this._cornerC.y = Math.round(this._cornerC.y);
		this._cornerD.x = Math.round(this._cornerD.x);
		this._cornerD.y = Math.round(this._cornerD.y);

		// Calculate bounding box (AS3: lines 688-691)
		const minX = Math.min(this._cornerA.x, this._cornerB.x, this._cornerC.x, this._cornerD.x);
		const maxX = Math.max(this._cornerA.x, this._cornerB.x, this._cornerC.x, this._cornerD.x);
		const minY = Math.min(this._cornerA.y, this._cornerB.y, this._cornerC.y, this._cornerD.y);
		const maxY = Math.max(this._cornerA.y, this._cornerB.y, this._cornerC.y, this._cornerD.y);

		// Calculate dimensions (AS3: lines 692, 698, 704-705)
		this._width = maxX - minX;
		this._height = maxY - minY;

		// Transform corners AND offset to local space (AS3: lines 693-703)
		// This is CRITICAL - AS3 subtracts minX/minY from ALL corners and offset
		this._offset.x -= minX;
		this._offset.y -= minY;
		this._cornerA.x -= minX;
		this._cornerA.y -= minY;
		this._cornerB.x -= minX;
		this._cornerB.y -= minY;
		this._cornerC.x -= minX;
		this._cornerC.y -= minY;
		this._cornerD.x -= minX;
		this._cornerD.y -= minY;
	}

	private render(geometry: IRoomGeometry): void
	{
		this._graphics.clear();

		if (!this.visible)
		{
			return;
		}

		// Skip degenerate planes
		if (this._width < 0.5 && this._height < 0.5)
		{
			return;
		}

		// Draw the plane as a filled polygon using PixiJS v8 poly() method
		// Corners are in LOCAL space (0 to width/height) after updateCorners transformation
		this._graphics
			.poly([
				this._cornerA.x, this._cornerA.y,
				this._cornerB.x, this._cornerB.y,
				this._cornerC.x, this._cornerC.y,
				this._cornerD.x, this._cornerD.y
			])
			.fill({color: this._color});

		// Position the graphics at the offset
		// offset = screenPoint(_origin) - minX/minY
		// So -offset = minX - screenPoint(_origin), which positions the plane relative to the room origin
		this._graphics.x = -this._offset.x;
		this._graphics.y = -this._offset.y;
	}
}
