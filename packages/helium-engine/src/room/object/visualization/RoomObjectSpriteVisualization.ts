/**
 * RoomObjectSpriteVisualization
 *
 * Based on AS3: com.sulake.room.object.visualization.RoomObjectSpriteVisualization
 *
 * Base class for sprite-based room object visualizations.
 * Manages a collection of sprites and provides rendering capabilities.
 * Syncs RoomObjectSprite data to actual PixiJS Sprites for display.
 */
import {Container, Sprite as PixiSprite, Texture} from 'pixi.js';
import type {IRoomObject} from '../IRoomObject';
import type {IRoomGeometry} from '@room/utils/IRoomGeometry';
import type {IRoomObjectSprite} from './IRoomObjectSprite';
import type {IRoomObjectSpriteVisualization} from './IRoomObjectSpriteVisualization';
import type {IRoomObjectVisualizationData} from './IRoomObjectVisualizationData';
import type {IGraphicAssetCollection} from './utils/IGraphicAssetCollection';
import {RoomObjectSprite} from './RoomObjectSprite';

let visualizationInstanceCounter = 0;

export class RoomObjectSpriteVisualization implements IRoomObjectSpriteVisualization
{
	protected static readonly LAYER_SEPARATOR: string = '_';
	protected static readonly ICON_LAYER_ID: string = '_icon_';
	protected _scale: number = -1;
	protected _updateModelCounter: number = -1;
	protected _direction: number = -1;
	private _assetCollection: IGraphicAssetCollection | null = null;
	private _sprites: RoomObjectSprite[] = [];
	private _displaySprites: PixiSprite[] = [];
	private _displaySpriteUpdateIds: number[] = [];
	private _instanceId: number;
	private _updateId: number = 0;
	private _cachedBounds: { x: number; y: number; width: number; height: number } = {x: 0, y: 0, width: 0, height: 0};
	private _boundsDirty: boolean = true;

	constructor()
	{
		this._instanceId = visualizationInstanceCounter++;
		this._container = new Container();
		this._container.label = `RoomObjectVisualization_${this._instanceId}`;
		this._container.sortableChildren = true;
	}

	private _object: IRoomObject | null = null;

	get object(): IRoomObject | null
	{
		return this._object;
	}

	set object(value: IRoomObject | null)
	{
		this._object = value;
	}

	get assetCollection(): IGraphicAssetCollection | null
	{
		return this._assetCollection;
	}

	set assetCollection(value: IGraphicAssetCollection | null)
	{
		this._assetCollection = value;
	}

	private _container: Container;

	get container(): Container
	{
		return this._container;
	}

	get spriteCount(): number
	{
		return this._sprites.length;
	}

	/**
	 * Get the bounding rectangle of all visible sprites
	 */
	get boundingRectangle(): { x: number; y: number; width: number; height: number }
	{
		if (!this._boundsDirty)
		{
			return this._cachedBounds;
		}

		let left = 0;
		let top = 0;
		let right = 0;
		let bottom = 0;
		let first = true;

		for (let i = 0; i < this._sprites.length; i++)
		{
			const sprite = this._sprites[i];

			if (sprite !== null && sprite.visible && sprite.texture !== null)
			{
				const x = sprite.offsetX;
				const y = sprite.offsetY;

				if (first)
				{
					left = x;
					top = y;
					right = x + sprite.width;
					bottom = y + sprite.height;
					first = false;
				}
				else
				{
					if (x < left) left = x;
					if (y < top) top = y;
					if (x + sprite.width > right) right = x + sprite.width;
					if (y + sprite.height > bottom) bottom = y + sprite.height;
				}
			}
		}

		this._cachedBounds.x = left;
		this._cachedBounds.y = top;
		this._cachedBounds.width = right - left;
		this._cachedBounds.height = bottom - top;
		this._boundsDirty = false;

		return this._cachedBounds;
	}

	dispose(): void
	{
		if (this._sprites !== null)
		{
			while (this._sprites.length > 0)
			{
				const sprite = this._sprites[0];

				if (sprite !== null)
				{
					sprite.dispose();
				}

				this._sprites.pop();
			}

			this._sprites = [];
		}

		this._displaySprites = [];
		this._displaySpriteUpdateIds = [];
		this._object = null;
		this._container.destroy({children: true});
	}

	getUpdateID(): number
	{
		return this._updateId;
	}

	getInstanceId(): number
	{
		return this._instanceId;
	}

	addSprite(): IRoomObjectSprite
	{
		return this.addSpriteAt(this._sprites.length);
	}

	addSpriteAt(index: number): IRoomObjectSprite
	{
		const sprite = new RoomObjectSprite();

		if (index >= this._sprites.length)
		{
			this._sprites.push(sprite);
		}
		else
		{
			this._sprites.splice(index, 0, sprite);
		}

		return sprite;
	}

	removeSprite(sprite: IRoomObjectSprite): void
	{
		const index = this._sprites.indexOf(sprite as RoomObjectSprite);

		if (index === -1)
		{
			throw new Error('Trying to remove non-existing sprite!');
		}

		this._sprites.splice(index, 1);
		(sprite as RoomObjectSprite).dispose();
	}

	getSprite(index: number): IRoomObjectSprite | null
	{
		if (index >= 0 && index < this._sprites.length)
		{
			return this._sprites[index];
		}

		return null;
	}

	update(geometry: IRoomGeometry, time: number, update: boolean, skipUpdate: boolean): void
	{
		// Override in subclasses
	}

	getSpriteList(): IRoomObjectSprite[] | null
	{
		return null;
	}

	initialize(data: IRoomObjectVisualizationData): boolean
	{
		return false;
	}

	protected createSprites(count: number): void
	{
		// Remove excess sprites
		while (this._sprites.length > count)
		{
			const sprite = this._sprites[this._sprites.length - 1];

			if (sprite !== null)
			{
				sprite.dispose();
			}

			this._sprites.pop();
		}

		// Add missing sprites
		while (this._sprites.length < count)
		{
			const sprite = new RoomObjectSprite();
			this._sprites.push(sprite);
		}
	}

	protected increaseUpdateId(): void
	{
		this._updateId++;
		this._boundsDirty = true;
		this.syncSpritesToDisplay();
	}

	protected reset(): void
	{
		this._scale = 0xFFFFFFFF;
		this._updateModelCounter = 0xFFFFFFFF;
		this._direction = -1;
	}

	/**
	 * Synchronize RoomObjectSprite data to actual PixiJS Sprites in the container.
	 * Creates, updates, or removes PixiJS Sprites to match the current sprite data.
	 */
	private syncSpritesToDisplay(): void
	{
		const spriteCount = this._sprites.length;

		// Remove excess display sprites
		while (this._displaySprites.length > spriteCount)
		{
			const ds = this._displaySprites.pop()!;
			this._displaySpriteUpdateIds.pop();
			this._container.removeChild(ds);
			ds.destroy();
		}

		// Ensure enough display sprites exist
		while (this._displaySprites.length < spriteCount)
		{
			const ds = new PixiSprite();
			ds.anchor.set(0, 0);
			this._displaySprites.push(ds);
			this._displaySpriteUpdateIds.push(-1);
			this._container.addChild(ds);
		}

		// Sync each sprite's properties
		for (let i = 0; i < spriteCount; i++)
		{
			const src = this._sprites[i];
			const dst = this._displaySprites[i];

			// Skip if unchanged
			if (this._displaySpriteUpdateIds[i] === src.updateId)
			{
				continue;
			}

			this._displaySpriteUpdateIds[i] = src.updateId;

			// Texture
			if (src.texture !== null)
			{
				dst.texture = src.texture;
			}
			else
			{
				dst.texture = Texture.EMPTY;
			}

			// Visibility
			dst.visible = src.visible && src.texture !== null;

			if (!dst.visible)
			{
				continue;
			}

			// Position (offsets)
			if (src.flipH)
			{
				dst.scale.x = -1;
				dst.position.x = -src.offsetX;
			}
			else
			{
				dst.scale.x = 1;
				dst.position.x = src.offsetX;
			}

			if (src.flipV)
			{
				dst.scale.y = -1;
				dst.position.y = -src.offsetY;
			}
			else
			{
				dst.scale.y = 1;
				dst.position.y = src.offsetY;
			}

			// Alpha (0-255 → 0-1)
			dst.alpha = src.alpha / 255;

			// Tint (color)
			if (src.color !== 0xFFFFFF)
			{
				dst.tint = src.color;
			}
			else
			{
				dst.tint = 0xFFFFFF;
			}

			// Blend mode
			dst.blendMode = src.blendMode as any;

			// Z-index (relative depth)
			dst.zIndex = -src.relativeDepth;
		}
	}
}
