/**
 * RoomRenderingCanvas
 *
 * @see source_as_flash/com/sulake/room/renderer/RoomSpriteCanvas.as
 *
 * Main rendering canvas for room visualization.
 * Manages the PixiJS container that holds all room visuals.
 * Handles mouse event hit-testing across all room object sprites.
 */
import {Container, Sprite as PixiSprite} from 'pixi.js';
import type {IRoomGeometry} from '@room/utils/IRoomGeometry';
import type {IRoomObjectSpriteVisualization} from '@room/object/visualization/IRoomObjectSpriteVisualization';
import type {IRoomObject} from '@room/object/IRoomObject';
import {RoomGeometry} from '@room/utils/RoomGeometry';
import {RoomSpriteMouseEvent} from '@room/events/RoomSpriteMouseEvent';
import {Vector3d} from '@room/utils/Vector3d';

/**
 * Listener interface for processing canvas mouse events.
 * Based on AS3 IRoomRenderingCanvasMouseListener.
 */
export interface IRoomRenderingCanvasMouseListener
{
	processRoomCanvasMouseEvent(event: RoomSpriteMouseEvent, object: IRoomObject, geometry: IRoomGeometry): void;
}

/**
 * Internal tracking data for mouse-active objects (hover state).
 */
interface ObjectMouseData
{
	objectId: string;
	spriteTag: string;
}

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

	// Mouse tracking — based on AS3 RoomSpriteCanvas fields
	private _mouseListener: IRoomRenderingCanvasMouseListener | null = null;
	private _visualizations: Map<Container, IRoomObjectSpriteVisualization> = new Map();
	private _mouseActiveObjects: Map<string, ObjectMouseData> = new Map();
	private _eventCache: Map<string, RoomSpriteMouseEvent> = new Map();
	private _mouseCheckCount: number = 0;
	private _mouseSpriteWasHit: boolean = false;
	private _mouseLocationX: number = 0;
	private _mouseLocationY: number = 0;
	private _mouseOldX: number = 0;
	private _mouseOldY: number = 0;
	private _eventId: number = 0;

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
		// Location (11, 11, 5) is the center point of the view - matches Nitro
		this._geometry = new RoomGeometry(
			scale,
			new Vector3d(-135, 30, 0),   // Direction (rotation angles)
			new Vector3d(11, 11, 5),     // Location (view center)
			new Vector3d(-135, 0.5, 0)   // Depth direction
		);

		// Initialize container position
		this.updateContainerPosition();
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

	get disposed(): boolean
	{
		return this._disposed;
	}

	get mouseListener(): IRoomRenderingCanvasMouseListener | null
	{
		return this._mouseListener;
	}

	set mouseListener(value: IRoomRenderingCanvasMouseListener | null)
	{
		this._mouseListener = value;
	}

	initialize(width: number, height: number): void
	{
		this._width = width;
		this._height = height;

		this.updateContainerPosition();
	}

	setScale(scale: number, point: { x: number; y: number } | null = null, offsetPoint: {
		x: number;
		y: number
	} | null = null): void
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
			new Vector3d(11, 11, 5),
			new Vector3d(-135, 0.5, 0)
		);
	}

	setScreenOffset(x: number, y: number): void
	{
		this._screenOffsetX = x;
		this._screenOffsetY = y;

		this.updateContainerPosition();
	}

	render(time: number, skipOffset: boolean = false): void
	{
		// Rendering is handled by PixiJS automatically
		// This method can be used for any per-frame updates if needed
	}

	/**
	 * Handle mouse events by hit-testing against all room sprites.
	 * Based on AS3 RoomSpriteCanvas.handleMouseEvent()
	 *
	 * @param x - Screen X coordinate
	 * @param y - Screen Y coordinate
	 * @param type - Mouse event type ('mouse_move', 'click', 'double_click')
	 * @param altKey - Alt key state
	 * @param ctrlKey - Ctrl key state
	 * @param shiftKey - Shift key state
	 * @param buttonDown - Mouse button state
	 * @returns True if any sprite was hit
	 */
	handleMouseEvent(
		x: number, y: number, type: string,
		altKey: boolean = false, ctrlKey: boolean = false,
		shiftKey: boolean = false, buttonDown: boolean = false
	): boolean
	{
		// Convert screen coords to canvas-local coords
		const localX = (x - this._screenOffsetX - this._width / 2);
		const localY = (y - this._screenOffsetY - this._height / 3);

		this._mouseLocationX = localX;
		this._mouseLocationY = localY;

		// Optimization: if already checked this frame for mouse_move, return cached result
		if (this._mouseCheckCount > 0 && type === 'mouse_move')
		{
			return this._mouseSpriteWasHit;
		}

		this._mouseSpriteWasHit = this.checkMouseHits(localX, localY, type, altKey, ctrlKey, shiftKey, buttonDown);
		this._mouseCheckCount++;

		return this._mouseSpriteWasHit;
	}

	/**
	 * Per-frame update for mouse event processing.
	 * Based on AS3 RoomSpriteCanvas.update()
	 */
	updateMouseState(): void
	{
		if (this._mouseCheckCount === 0)
		{
			this.checkMouseHits(this._mouseLocationX, this._mouseLocationY, 'mouse_move');
		}

		this._mouseCheckCount = 0;
		this._eventId++;
	}

	/**
	 * Add a visualization container to the canvas.
	 */
	addVisualization(container: Container, zIndex: number = 0, visualization?: IRoomObjectSpriteVisualization): void
	{
		container.zIndex = zIndex;
		this._container.addChild(container);

		if (visualization)
		{
			this._visualizations.set(container, visualization);
		}
	}

	/**
	 * Remove a visualization container from the canvas.
	 */
	removeVisualization(container: Container): void
	{
		if (this._container.children.includes(container))
		{
			this._container.removeChild(container);
		}

		this._visualizations.delete(container);
	}

	/**
	 * Core hit-test method. Iterates all sprites in reverse z-order.
	 * Based on AS3 RoomSpriteCanvas._Str_19207() (checkMouseHits)
	 */
	private checkMouseHits(
		x: number, y: number, type: string,
		altKey: boolean = false, ctrlKey: boolean = false,
		shiftKey: boolean = false, buttonDown: boolean = false
	): boolean
	{
		let wasHit = false;
		const hitObjectIds: string[] = [];

		// Collect all visualization sprites sorted by z-order (highest/frontmost first)
		const allSprites = this.collectSortedSprites();

		for (let i = allSprites.length - 1; i >= 0; i--)
		{
			const entry = allSprites[i];
			const {visualization, sprite, displaySprite} = entry;

			if (!displaySprite || !displaySprite.visible)
			{
				continue;
			}

			// Check if the sprite's clickHandling flag means we skip it for move events
			if (sprite.clickHandling && (type === 'click' || type === 'double_click'))
			{
				// Click-handling sprites are only handled by the click handler
				continue;
			}

			// Hit test: check if point is within sprite bounds
			const spriteLocalX = x - (displaySprite.parent?.x ?? 0) - displaySprite.x;
			const spriteLocalY = y - (displaySprite.parent?.x ?? 0) - displaySprite.y;

			const bounds = displaySprite.getBounds();

			// Convert to global point for bounds check
			const globalX = x + this._container.x;
			const globalY = y + this._container.y;

			if (!this.hitTestSprite(displaySprite, globalX, globalY))
			{
				continue;
			}

			// Get object identifier
			const object = visualization.object;

			if (!object)
			{
				continue;
			}

			const objectId = `${object.getId()}_${object.getType()}`;

			if (hitObjectIds.includes(objectId))
			{
				continue;
			}

			const spriteTag = sprite.tag;
			const activeData = this._mouseActiveObjects.get(objectId);

			// Handle roll-over/roll-out transitions
			if (activeData && activeData.spriteTag !== spriteTag)
			{
				// Sprite changed on same object - send roll_out for old sprite
				const rollOutEvent = this.createMouseEvent(0, 0, 0, 0, 'roll_out', activeData.spriteTag, altKey, ctrlKey, shiftKey, buttonDown);
				this.bufferMouseEvent(rollOutEvent, objectId);
			}

			let event: RoomSpriteMouseEvent;

			if (type === 'mouse_move' && (!activeData || activeData.spriteTag !== spriteTag))
			{
				// New object or different sprite — send roll_over
				event = this.createMouseEvent(
					x, y,
					spriteLocalX, spriteLocalY,
					'roll_over', spriteTag,
					altKey, ctrlKey, shiftKey, buttonDown
				);
			}
			else
			{
				event = this.createMouseEvent(
					x, y,
					spriteLocalX, spriteLocalY,
					type, spriteTag,
					altKey, ctrlKey, shiftKey, buttonDown
				);
			}

			// Update active object tracking
			if (!activeData)
			{
				this._mouseActiveObjects.set(objectId, {objectId, spriteTag});
			}
			else
			{
				activeData.spriteTag = spriteTag;
			}

			// Only buffer if coordinates changed or it's not a mouse_move
			if (type !== 'mouse_move' || x !== this._mouseOldX || y !== this._mouseOldY)
			{
				this.bufferMouseEvent(event, objectId);
			}

			hitObjectIds.push(objectId);
			wasHit = true;
		}

		// Generate roll_out events for objects no longer under the mouse
		for (const [objectId, data] of this._mouseActiveObjects)
		{
			if (!hitObjectIds.includes(objectId))
			{
				const rollOutEvent = this.createMouseEvent(0, 0, 0, 0, 'roll_out', data.spriteTag, altKey, ctrlKey, shiftKey, buttonDown);
				this.bufferMouseEvent(rollOutEvent, objectId);
				this._mouseActiveObjects.delete(objectId);
			}
		}

		// Process all buffered events
		this.processMouseEvents();

		this._mouseOldX = x;
		this._mouseOldY = y;

		return wasHit;
	}

	/**
	 * Collect all visualization sprites flattened and sorted for hit-testing.
	 * Returns entries with visualization, sprite data, and display sprite references.
	 */
	private collectSortedSprites(): Array<{
		visualization: IRoomObjectSpriteVisualization;
		sprite: { tag: string; clickHandling: boolean; visible: boolean };
		displaySprite: PixiSprite;
		zOrder: number;
	}>
	{
		const result: Array<{
			visualization: IRoomObjectSpriteVisualization;
			sprite: { tag: string; clickHandling: boolean; visible: boolean };
			displaySprite: PixiSprite;
			zOrder: number;
		}> = [];

		for (const [container, visualization] of this._visualizations)
		{
			const parentZ = container.zIndex;

			for (let i = 0; i < container.children.length; i++)
			{
				const child = container.children[i];

				if (child instanceof PixiSprite && child.visible)
				{
					// Find matching RoomObjectSprite data
					const sprite = visualization.getSprite(i);

					if (sprite && sprite.visible)
					{
						result.push({
							visualization,
							sprite: {tag: sprite.tag, clickHandling: sprite.clickHandling, visible: sprite.visible},
							displaySprite: child,
							zOrder: parentZ * 10000 + child.zIndex
						});
					}
				}
			}
		}

		// Sort by z-order ascending (we iterate in reverse for hit-testing)
		result.sort((a, b) => a.zOrder - b.zOrder);

		return result;
	}

	/**
	 * Simple bounds-based hit test for a PixiJS sprite.
	 */
	private hitTestSprite(sprite: PixiSprite, globalX: number, globalY: number): boolean
	{
		const bounds = sprite.getBounds();

		return globalX >= bounds.x
			&& globalX <= bounds.x + bounds.width
			&& globalY >= bounds.y
			&& globalY <= bounds.y + bounds.height;
	}

	/**
	 * Create a RoomSpriteMouseEvent.
	 * Based on AS3 RoomSpriteCanvas._Str_11609()
	 */
	private createMouseEvent(
		x: number, y: number,
		localX: number, localY: number,
		type: string, spriteTag: string,
		altKey: boolean, ctrlKey: boolean,
		shiftKey: boolean, buttonDown: boolean
	): RoomSpriteMouseEvent
	{
		const canvasId = `canvas_${this._id}`;
		const eventId = `${canvasId}_${this._eventId}`;

		return new RoomSpriteMouseEvent(
			type, eventId, canvasId, spriteTag,
			x, y,
			localX, localY,
			ctrlKey, altKey, shiftKey, buttonDown
		);
	}

	/**
	 * Buffer a mouse event for later processing.
	 * Based on AS3 RoomSpriteCanvas._Str_14715()
	 */
	private bufferMouseEvent(event: RoomSpriteMouseEvent, objectId: string): void
	{
		this._eventCache.set(objectId, event);
	}

	/**
	 * Process all buffered mouse events by dispatching to room objects.
	 * Based on AS3 RoomSpriteCanvas._Str_20604()
	 */
	private processMouseEvents(): void
	{
		for (const [objectId, event] of this._eventCache)
		{
			// Find the visualization for this object
			const object = this.findObjectById(objectId);

			if (!object)
			{
				continue;
			}

			if (this._mouseListener)
			{
				this._mouseListener.processRoomCanvasMouseEvent(event, object, this._geometry);
			}
			else
			{
				const handler = object.getMouseHandler();

				if (handler)
				{
					handler.mouseEvent(event, this._geometry);
				}
			}
		}

		this._eventCache.clear();
	}

	/**
	 * Find a room object by its composite objectId string.
	 */
	private findObjectById(objectId: string): IRoomObject | null
	{
		for (const visualization of this._visualizations.values())
		{
			const object = visualization.object;

			if (object)
			{
				const id = `${object.getId()}_${object.getType()}`;

				if (id === objectId)
				{
					return object;
				}
			}
		}

		return null;
	}

	private updateContainerPosition(): void
	{
		this._container.x = this._screenOffsetX + this._width / 2;
		this._container.y = this._screenOffsetY + this._height / 3;
	}

	dispose(): void
	{
		if (this._disposed)
		{
			return;
		}

		this._visualizations.clear();
		this._mouseActiveObjects.clear();
		this._eventCache.clear();
		this._mouseListener = null;
		this._container.destroy({children: true});
		this._geometry.dispose();
		this._disposed = true;
	}
}
