/**
 * RoomRenderingCanvas
 *
 * Based on AS3: com.sulake.room.renderer.RoomSpriteCanvas
 *
 * Main rendering canvas for room visualization.
 * Owns a flat display list of ExtendedSprite children.
 * Each frame: reads sprite data from visualizations, builds a SortableSprite list,
 * sorts by Z, and creates/updates canvas-owned ExtendedSprite display objects.
 * Hit-testing iterates ExtendedSprite children backwards (front to back).
 *
 * @see sources/flash_version/com/sulake/room/renderer/RoomSpriteCanvas.as
 */
import {Container} from 'pixi.js';
import type {IRoomGeometry} from '@room/utils/IRoomGeometry';
import type {IRoomObjectSpriteVisualization} from '@room/object/visualization/IRoomObjectSpriteVisualization';
import type {IRoomObject} from '@room/object/IRoomObject';
import {RoomGeometry} from '@room/utils/RoomGeometry';
import {RoomSpriteMouseEvent} from '@room/events/RoomSpriteMouseEvent';
import {Vector3d} from '@room/utils/Vector3d';
import {ExtendedSprite} from './utils/ExtendedSprite';
import {SortableSprite} from './utils/SortableSprite';
import {ObjectMouseData} from './utils/ObjectMouseData';

/**
 * Listener interface for processing canvas mouse events.
 * Based on AS3 IRoomRenderingCanvasMouseListener.
 */
export interface IRoomRenderingCanvasMouseListener
{
	processRoomCanvasMouseEvent(event: RoomSpriteMouseEvent, object: IRoomObject, geometry: IRoomGeometry): void;
}

/**
 * Stored visualization entry — visualization + its room object.
 */
interface VisualizationEntry
{
	visualization: IRoomObjectSpriteVisualization;
	object: IRoomObject;
}

export class RoomRenderingCanvas
{

	private _sortableSpriteList: SortableSprite[] = [];
	private _spritePool: ExtendedSprite[] = [];
	private _spriteCount: number = 0;
	private _activeSpriteCount: number = 0;
	private _mouseActiveObjects: Map<string, ObjectMouseData> = new Map();
	private _eventCache: Map<string, RoomSpriteMouseEvent> = new Map();
	private _mouseLocationX: number = 0;
	private _mouseLocationY: number = 0;
	private _mouseOldX: number = -10000000;
	private _mouseOldY: number = -10000000;
	private _mouseCheckCount: number = 0;
	private _mouseSpriteWasHit: boolean = false;
	private _eventId: number = 0;
	private _renderTimeStamp: number = -1;
	private _skipObjectUpdate: boolean = false;
	private _visualizations: Map<string, VisualizationEntry> = new Map();
	private _zOrderDirty: boolean = true;

	private readonly _master: Container;
	private readonly _display: Container;
	private readonly _id: number;
	private _geometryScale: number = 64;

	constructor(id: number, width: number, height: number, scale: number)
	{
		this._id = id;
		this._width = width;
		this._height = height;
		// AS3: _scale = 1 (display scale), _Str_6356 = scale (geometry scale)
		this._scale = 1;
		this._geometryScale = scale;

		// AS3: _master = new Sprite(), _display = new Sprite() added to _master
		this._master = new Container();
		this._master.label = `RoomRenderingCanvas_${id}`;

		this._display = new Container();
		this._display.label = 'canvas';
		this._master.addChild(this._display);

		// Create geometry with default direction (isometric view)
		this._geometry = new RoomGeometry(
			scale,
			new Vector3d(-135, 30, 0),
			new Vector3d(11, 11, 5),
			new Vector3d(-135, 0.5, 0)
		);
	}

	get id(): number
	{
		return this._id;
	}

	private _geometry: RoomGeometry;

	get geometry(): RoomGeometry
	{
		return this._geometry;
	}

	private _width: number = 0;

	get width(): number
	{
		return this._width;
	}

	private _height: number = 0;

	get height(): number
	{
		return this._height;
	}

	private _screenOffsetX: number = 0;

	get screenOffsetX(): number
	{
		return this._screenOffsetX;
	}

	set screenOffsetX(value: number)
	{
		this._mouseLocationX -= (value - this._screenOffsetX);
		this._screenOffsetX = value;
	}

	private _screenOffsetY: number = 0;

	get screenOffsetY(): number
	{
		return this._screenOffsetY;
	}

	set screenOffsetY(value: number)
	{
		this._mouseLocationY -= (value - this._screenOffsetY);
		this._screenOffsetY = value;
	}

	private _scale: number = 1;

	get scale(): number
	{
		return this._scale;
	}

	private _mouseListener: IRoomRenderingCanvasMouseListener | null = null;

	get mouseListener(): IRoomRenderingCanvasMouseListener | null
	{
		return this._mouseListener;
	}

	set mouseListener(value: IRoomRenderingCanvasMouseListener | null)
	{
		this._mouseListener = value;
	}

	private _disposed: boolean = false;

	get disposed(): boolean
	{
		return this._disposed;
	}

	/**
	 * The display container (added to PixiJS stage).
	 * AS3: get displayObject() returns _master.
	 */
	get container(): Container
	{
		return this._master;
	}

	/**
	 * Initialize canvas dimensions.
	 * AS3: initialize(width, height)
	 */
	initialize(width: number, height: number): void
	{
		if (width < 1) width = 1;
		if (height < 1) height = 1;
		this._width = width;
		this._height = height;
	}

	/**
	 * Set the zoom scale (geometry scale).
	 * AS3: _Str_13261 — changes geometry scale and computes display scale as ratio.
	 */
	setScale(scale: number): void
	{
		if (scale === this._geometryScale) return;

		// AS3: _scale = newScale / originalScale (display zoom ratio)
		this._scale = scale / this._geometryScale;
		this._geometryScale = scale;

		// Recreate geometry with new scale
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
	}

	/**
	 * Add a visualization and its object to the canvas.
	 * AS3: visualizations are iterated via container.getRoomObjectWithIndex().
	 */
	addVisualization(visualization: IRoomObjectSpriteVisualization, object: IRoomObject): void
	{
		const objectId = `${object.getId()}_${object.getType()}`;
		this._visualizations.set(objectId, {visualization, object});
		this._zOrderDirty = true;
	}

	/**
	 * Remove a visualization from the canvas.
	 */
	removeVisualization(objectId: string): void
	{
		this._visualizations.delete(objectId);
		this._zOrderDirty = true;
	}

	/**
	 * Remove a visualization by object reference.
	 */
	removeVisualizationByObject(object: IRoomObject): void
	{
		const objectId = `${object.getId()}_${object.getType()}`;
		this._visualizations.delete(objectId);
		this._zOrderDirty = true;
	}

	/**
	 * Main render loop. Called each frame.
	 * Based on AS3 RoomSpriteCanvas.render()
	 *
	 * @see sources/flash_version/com/sulake/room/renderer/RoomSpriteCanvas.as line 390
	 */
	render(time: number): void
	{
		if (this._geometry === null)
		{
			return;
		}

		if (time === this._renderTimeStamp)
		{
			return;
		}

		this._skipObjectUpdate = !this._skipObjectUpdate;

		// Update display position (AS3: display.x/y/scaleX/scaleY)
		this._display.x = this._screenOffsetX;
		this._display.y = this._screenOffsetY;
		this._display.scale.x = this._scale;
		this._display.scale.y = this._scale;

		let spriteIndex = 0;

		// Iterate all visualizations, update them, build SortableSprite list
		// AS3: for each room object → _Str_24532()
		for (const [objectId, entry] of this._visualizations)
		{
			spriteIndex += this.renderObject(entry.visualization, entry.object, objectId, time, spriteIndex);
		}

		// Sort by z descending (AS3: sortOn("z", DESCENDING|NUMERIC))
		// Only re-sort when z-order may have changed (dirty flag)
		if (spriteIndex > 0 && this._zOrderDirty)
		{
			// Sort in-place up to spriteIndex using a compare on the sub-range
			const list = this._sortableSpriteList;
			// Insertion sort is efficient for nearly-sorted data (typical frame-to-frame)
			for (let i = 1; i < spriteIndex; i++)
			{
				const temp = list[i];
				let j = i - 1;

				while (j >= 0 && list[j].z < temp.z)
				{
					list[j + 1] = list[j];
					j--;
				}

				list[j + 1] = temp;
			}

			this._zOrderDirty = false;
		}

		// Trim excess sortable sprites
		if (spriteIndex < this._sortableSpriteList.length)
		{
			this._sortableSpriteList.length = spriteIndex;
		}

		// Update ExtendedSprites from sorted list
		for (let i = 0; i < spriteIndex; i++)
		{
			const sortable = this._sortableSpriteList[i];

			if (sortable !== null)
			{
				this.updateSprite(i, sortable);
			}
		}

		// Hide/pool unused sprites beyond spriteIndex
		this.cleanSprites(spriteIndex);

		this._renderTimeStamp = time;
	}

	/**
	 * Handle mouse events by hit-testing against all room sprites.
	 * Based on AS3 RoomSpriteCanvas.handleMouseEvent()
	 *
	 * @see sources/flash_version/com/sulake/room/renderer/RoomSpriteCanvas.as line 1005
	 */
	handleMouseEvent(
		x: number, y: number, type: string,
		altKey: boolean = false, ctrlKey: boolean = false,
		shiftKey: boolean = false, buttonDown: boolean = false
	): boolean
	{
		// Convert to canvas-local coords (AS3: subtract screenOffset, divide by scale)
		x = x - this._screenOffsetX;
		y = y - this._screenOffsetY;
		this._mouseLocationX = x / this._scale;
		this._mouseLocationY = y / this._scale;

		// Optimization: skip redundant mouse_move checks within same frame
		if (this._mouseCheckCount > 0 && type === 'mouse_move')
		{
			return this._mouseSpriteWasHit;
		}

		this._mouseSpriteWasHit = this.checkMouseHits(
			Math.floor(this._mouseLocationX),
			Math.floor(this._mouseLocationY),
			type, altKey, ctrlKey, shiftKey, buttonDown
		);
		this._mouseCheckCount++;

		return this._mouseSpriteWasHit;
	}

	/**
	 * Per-frame update for mouse event processing.
	 * Based on AS3 RoomSpriteCanvas.update()
	 *
	 * @see sources/flash_version/com/sulake/room/renderer/RoomSpriteCanvas.as line 1222
	 */
	updateMouseState(): void
	{
		if (this._mouseCheckCount === 0)
		{
			this.checkMouseHits(
				Math.floor(this._mouseLocationX),
				Math.floor(this._mouseLocationY),
				'mouse_move'
			);
		}

		this._mouseCheckCount = 0;
		this._eventId++;
	}

	dispose(): void
	{
		if (this._disposed) return;

		this.cleanSprites(0);

		if (this._geometry !== null)
		{
			this._geometry.dispose();
		}

		// Dispose pooled sprites
		for (const sprite of this._spritePool)
		{
			sprite.dispose();
		}

		this._spritePool = [];
		this._sortableSpriteList = [];
		this._visualizations.clear();
		this._mouseActiveObjects.clear();
		this._eventCache.clear();
		this._mouseListener = null;
		this._master.destroy({children: true});
		this._disposed = true;
	}

	/**
	 * Process a single room object's sprites into the SortableSprite list.
	 * Based on AS3 RoomSpriteCanvas._Str_24532()
	 *
	 * @see sources/flash_version/com/sulake/room/renderer/RoomSpriteCanvas.as line 514
	 */
	private renderObject(
		visualization: IRoomObjectSpriteVisualization,
		object: IRoomObject,
		objectId: string,
		time: number,
		startIndex: number
	): number
	{
		// Get screen position of the object
		const location = object.getLocation();
		const screenPos = this._geometry.getScreenPosition(location);

		if (screenPos === null)
		{
			return 0;
		}

		// Update the visualization (may change sprite z-values)
		visualization.update(this._geometry, time, true, false);
		this._zOrderDirty = true;

		const spriteCount = visualization.spriteCount;

		// Screen center offset (AS3: screenX += _wd / 2, screenY += _ht / 2)
		const screenX = Math.floor(screenPos.x) + Math.floor(this._width / 2);
		const screenY = Math.floor(screenPos.y) + Math.floor(this._height / 2);

		// Base Z with sub-pixel offset (AS3: 1.2E-7 * x)
		let baseZ = screenPos.z;

		if (screenPos.x > 0)
		{
			baseZ += screenPos.x * 1.2e-7;
		}
		else
		{
			baseZ += (-screenPos.x) * 1.2e-7;
		}

		let localCount = 0;

		for (let i = 0; i < spriteCount; i++)
		{
			const sprite = visualization.getSprite(i);

			if (sprite === null || !sprite.visible)
			{
				continue;
			}

			// AS3: if(asset == null) continue
			if (sprite.texture === null)
			{
				continue;
			}

			const finalX = screenX + sprite.offsetX + this._screenOffsetX;
			const finalY = screenY + sprite.offsetY + this._screenOffsetY;

			// Get or create SortableSprite
			const sortableIndex = startIndex + localCount;
			let sortable: SortableSprite;

			if (sortableIndex < this._sortableSpriteList.length)
			{
				sortable = this._sortableSpriteList[sortableIndex];
			}
			else
			{
				sortable = new SortableSprite();
				this._sortableSpriteList.push(sortable);
			}

			sortable.name = objectId;
			sortable.sprite = sprite;
			sortable.x = finalX - this._screenOffsetX;
			sortable.y = finalY - this._screenOffsetY;
			sortable.z = baseZ + sprite.relativeDepth + 3.7e-11 * (startIndex + localCount);

			localCount++;
		}

		return localCount;
	}

	/**
	 * Update or create an ExtendedSprite at the given display index.
	 * Based on AS3 RoomSpriteCanvas.updateSprite()
	 *
	 * @see sources/flash_version/com/sulake/room/renderer/RoomSpriteCanvas.as line 704
	 */
	private updateSprite(index: number, sortable: SortableSprite): void
	{
		const sprite = sortable.sprite;

		if (sprite === null)
		{
			return;
		}

		let extSprite: ExtendedSprite;

		if (index >= this._spriteCount)
		{
			// Need a new ExtendedSprite — pop from pool or create
			if (this._spritePool.length > 0)
			{
				extSprite = this._spritePool.pop()!;
			}
			else
			{
				extSprite = new ExtendedSprite();
			}

			this._display.addChild(extSprite);
			this._spriteCount++;
		}
		else
		{
			extSprite = this._display.children[index] as ExtendedSprite;

			if (!extSprite)
			{
				return;
			}

			// Handle varyingDepth changes (AS3: remove and re-add)
			if (extSprite.varyingDepth !== sprite.varyingDepth)
			{
				if (extSprite.varyingDepth && !sprite.varyingDepth)
				{
					this._display.removeChildAt(index);
					this._spritePool.push(extSprite);
					this.updateSprite(index, sortable);
					return;
				}

				// Insert new sprite at this position
				const newSprite = this._spritePool.length > 0 ? this._spritePool.pop()! : new ExtendedSprite();
				this._display.addChildAt(newSprite, index);
				extSprite = newSprite;
			}
		}

		// Update sprite properties if changed
		// AS3: if(_Str_17574(instanceId, updateId))
		if (extSprite.needsUpdate(sprite.instanceId, sprite.updateId))
		{
			extSprite.alphaTolerance = sprite.alphaTolerance;

			const alpha = sprite.alpha / 255;

			if (extSprite.alpha !== alpha)
			{
				extSprite.alpha = alpha;
			}

			extSprite.identifier = sortable.name;
			extSprite.tag = sprite.tag;
			extSprite.varyingDepth = sprite.varyingDepth;
			extSprite.clickHandling = sprite.clickHandling;

			// Set texture (AS3: bitmapData = getBitmapData(asset, ...))
			if (sprite.texture !== null)
			{
				extSprite.setTexture(sprite.texture);
			}
			else
			{
				extSprite.setTexture(null);
			}

			// Handle flipping
			if (sprite.flipH)
			{
				extSprite.scale.x = -1;
			}
			else
			{
				extSprite.scale.x = 1;
			}

			if (sprite.flipV)
			{
				extSprite.scale.y = -1;
			}
			else
			{
				extSprite.scale.y = 1;
			}

			// Tint (color)
			if (sprite.color !== 0xFFFFFF)
			{
				extSprite.tint = sprite.color;
			}
			else
			{
				extSprite.tint = 0xFFFFFF;
			}

			// Blend mode
			extSprite.blendMode = sprite.blendMode as any;
		}

		// Always update position
		if (extSprite.x !== sortable.x)
		{
			extSprite.x = sortable.x;
		}

		if (extSprite.y !== sortable.y)
		{
			extSprite.y = sortable.y;
		}

		extSprite.offsetX = sprite.offsetX;
		extSprite.offsetY = sprite.offsetY;
		extSprite.visible = true;

		this._activeSpriteCount = Math.max(this._activeSpriteCount, index + 1);
	}

	/**
	 * Hide or pool unused sprites beyond the active count.
	 * Based on AS3 RoomSpriteCanvas._Str_20677()
	 */
	private cleanSprites(activeCount: number): void
	{
		for (let i = this._spriteCount - 1; i >= activeCount; i--)
		{
			const extSprite = this._display.children[i] as ExtendedSprite;

			if (extSprite)
			{
				extSprite.setTexture(null);
				extSprite.visible = false;
			}
		}

		this._activeSpriteCount = activeCount;
	}

	/**
	 * Get an ExtendedSprite at the given display index.
	 * AS3: getSprite()
	 */
	private getSprite(index: number): ExtendedSprite | null
	{
		if (index < 0 || index >= this._spriteCount)
		{
			return null;
		}

		return this._display.children[index] as ExtendedSprite ?? null;
	}

	/**
	 * Core hit-test method. Iterates sprites in reverse order (front to back).
	 * Based on AS3 RoomSpriteCanvas._Str_19207()
	 *
	 * @see sources/flash_version/com/sulake/room/renderer/RoomSpriteCanvas.as line 1069
	 */
	private checkMouseHits(
		x: number, y: number, type: string,
		altKey: boolean = false, ctrlKey: boolean = false,
		shiftKey: boolean = false, buttonDown: boolean = false
	): boolean
	{
		let wasHit = false;
		const hitObjectIds: Set<string> = new Set();

		// Iterate from frontmost to backmost (AS3: i from _activeSpriteCount-1 downto 0)
		for (let i = this._activeSpriteCount - 1; i >= 0; i--)
		{
			const extSprite = this.getSprite(i);

			if (extSprite === null || !extSprite.visible)
			{
				continue;
			}

			// Hit test in sprite-local coordinates
			const localX = x - extSprite.x;
			const localY = y - extSprite.y;

			if (!extSprite.hitTest(localX, localY))
			{
				continue;
			}

			// Skip click-handling sprites for non-click events (AS3 pattern)
			if (extSprite.clickHandling && (type === 'click' || type === 'double_click'))
			{
				continue;
			}

			const objectId = extSprite.identifier;

			if (hitObjectIds.has(objectId))
			{
				continue;
			}

			const spriteTag = extSprite.tag;
			const activeData = this._mouseActiveObjects.get(objectId);

			// Handle roll-over/roll-out transitions
			if (activeData !== undefined && activeData.spriteTag !== spriteTag)
			{
				const rollOutEvent = this.createMouseEvent(
					0, 0, 0, 0, 'roll_out', activeData.spriteTag,
					altKey, ctrlKey, shiftKey, buttonDown
				);

				this.bufferMouseEvent(rollOutEvent, objectId);
			}

			let event: RoomSpriteMouseEvent;

			if (type === 'mouse_move' && (activeData === undefined || activeData.spriteTag !== spriteTag))
			{
				// New object or different sprite → send roll_over
				event = this.createMouseEvent(
					x, y, localX, localY,
					'roll_over', spriteTag,
					altKey, ctrlKey, shiftKey, buttonDown
				);
			}
			else
			{
				event = this.createMouseEvent(
					x, y, localX, localY,
					type, spriteTag,
					altKey, ctrlKey, shiftKey, buttonDown
				);
				event.spriteOffsetX = extSprite.offsetX;
				event.spriteOffsetY = extSprite.offsetY;
			}

			// Update active object tracking
			if (activeData === undefined)
			{
				const newData = new ObjectMouseData();

				newData.objectId = objectId;
				newData.spriteTag = spriteTag;

				this._mouseActiveObjects.set(objectId, newData);
			}
			else
			{
				activeData.spriteTag = spriteTag;
			}

			// Only buffer if coordinates changed, or it's not mouse_move
			if (type !== 'mouse_move' || x !== this._mouseOldX || y !== this._mouseOldY)
			{
				this.bufferMouseEvent(event, objectId);
			}

			hitObjectIds.add(objectId);
			wasHit = true;
		}

		// Generate roll_out events for objects no longer under the mouse
		// AS3: iterate _mouseActiveObjects keys, remove those not in hitObjectIds
		const keysToRemove: string[] = [];

		for (const [objectId, data] of this._mouseActiveObjects)
		{
			if (!hitObjectIds.has(objectId))
			{
				const rollOutEvent = this.createMouseEvent(
					0, 0, 0, 0, 'roll_out', data.spriteTag,
					altKey, ctrlKey, shiftKey, buttonDown
				);
				this.bufferMouseEvent(rollOutEvent, objectId);
				keysToRemove.push(objectId);
			}
		}

		for (const key of keysToRemove)
		{
			this._mouseActiveObjects.delete(key);
		}

		// Process all buffered events
		this.processMouseEvents();

		this._mouseOldX = x;
		this._mouseOldY = y;

		return wasHit;
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
		// AS3: screenX = x - (wd/2), screenY = y - (ht/2)
		const screenX = x - Math.floor(this._width / 2);
		const screenY = y - Math.floor(this._height / 2);
		const canvasId = `canvas_${this._id}`;
		const eventId = `${canvasId}_${this._eventId}`;

		return new RoomSpriteMouseEvent(
			type, eventId, canvasId, spriteTag,
			screenX, screenY,
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
	 *
	 * @see sources/flash_version/com/sulake/room/renderer/RoomSpriteCanvas.as line 1175
	 */
	private processMouseEvents(): void
	{
		for (const [objectId, event] of this._eventCache)
		{
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
	 * AS3: container.getRoomObject(objectId)
	 */
	private findObjectById(objectId: string): IRoomObject | null
	{
		const entry = this._visualizations.get(objectId);

		if (entry)
		{
			return entry.object;
		}

		return null;
	}
}
