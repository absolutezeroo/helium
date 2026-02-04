/**
 * RoomRenderingCanvas
 *
 * Based on AS3: com.sulake.room.renderer (simplified)
 *
 * Main rendering canvas for room visualization.
 * Manages the PixiJS container that holds all room visuals.
 */
import {Container} from 'pixi.js';
import type {IRoomGeometry} from '@room/utils/IRoomGeometry';
import {RoomGeometry} from '@room/utils/RoomGeometry';
import {Vector3d} from '@room/utils/Vector3d';

export class RoomRenderingCanvas
{
	private _id: number;
	private _container: Container;
	private _geometry: RoomGeometry;
	private _width: number = 0;
	private _height: number = 0;
	private _screenOffsetX: number = 0;
	private _screenOffsetY: number = 0;
	private _scale: number = 1;
	private _disposed: boolean = false;

	constructor(id: number, width: number, height: number, scale: number)
	{
		this._id = id;
		this._width = width;
		this._height = height;
		this._scale = scale;

		this._container = new Container();
		this._container.label = `RoomRenderingCanvas_${id}`;
		this._container.sortableChildren = true;

		// Create geometry with default direction (isometric view)
		this._geometry = new RoomGeometry(
			scale,
			new Vector3d(-135, 30, 0),  // Direction (rotation angles)
			new Vector3d(0, 0, 0)        // Location
		);
	}

	dispose(): void
	{
		if (this._disposed)
		{
			return;
		}

		this._container.destroy({children: true});
		this._geometry.dispose();
		this._disposed = true;
	}

	get disposed(): boolean
	{
		return this._disposed;
	}

	get id(): number
	{
		return this._id;
	}

	get container(): Container
	{
		return this._container;
	}

	get geometry(): IRoomGeometry
	{
		return this._geometry;
	}

	get width(): number
	{
		return this._width;
	}

	get height(): number
	{
		return this._height;
	}

	get screenOffsetX(): number
	{
		return this._screenOffsetX;
	}

	set screenOffsetX(value: number)
	{
		this._screenOffsetX = value;
		this.updateContainerPosition();
	}

	get screenOffsetY(): number
	{
		return this._screenOffsetY;
	}

	set screenOffsetY(value: number)
	{
		this._screenOffsetY = value;
		this.updateContainerPosition();
	}

	get scale(): number
	{
		return this._scale;
	}

	initialize(width: number, height: number): void
	{
		this._width = width;
		this._height = height;
	}

	setScale(scale: number, point: {x: number; y: number} | null = null, offsetPoint: {x: number; y: number} | null = null): void
	{
		if (scale < 16)
		{
			scale = 16;
		}

		if (scale > 128)
		{
			scale = 128;
		}

		if (scale === this._scale)
		{
			return;
		}

		this._scale = scale;

		// Update geometry scale
		this._geometry = new RoomGeometry(
			scale,
			new Vector3d(-135, 30, 0),
			new Vector3d(0, 0, 0)
		);
	}

	setScreenOffset(x: number, y: number): void
	{
		this._screenOffsetX = x;
		this._screenOffsetY = y;
		this.updateContainerPosition();
	}

	private updateContainerPosition(): void
	{
		this._container.x = this._screenOffsetX + this._width / 2;
		this._container.y = this._screenOffsetY + this._height / 3;
	}

	render(time: number, skipOffset: boolean = false): void
	{
		// Rendering is handled by PixiJS automatically
		// This method can be used for any per-frame updates if needed
	}

	handleMouseEvent(x: number, y: number, type: string): boolean
	{
		// TODO: Implement mouse event handling for object interaction
		return false;
	}

	/**
	 * Add a visualization container to the canvas
	 */
	addVisualization(container: Container, zIndex: number = 0): void
	{
		container.zIndex = zIndex;
		this._container.addChild(container);
	}

	/**
	 * Remove a visualization container from the canvas
	 */
	removeVisualization(container: Container): void
	{
		if (this._container.children.includes(container))
		{
			this._container.removeChild(container);
		}
	}
}
