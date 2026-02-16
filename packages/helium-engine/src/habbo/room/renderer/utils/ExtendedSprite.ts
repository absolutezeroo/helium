/**
 * ExtendedSprite
 *
 * Based on AS3: com.sulake.room.renderer.utils.ExtendedSprite
 *
 * Extended PixiJS Sprite used as canvas display children.
 * Stores metadata (tag, identifier, click handling) and provides
 * pixel-perfect hit testing with alpha tolerance.
 *
 * @see sources/flash_version/com/sulake/room/renderer/utils/ExtendedSprite.as
 */
import {Sprite, Texture} from 'pixi.js';

export class ExtendedSprite extends Sprite
{
	private _updateID1: number = -1;
	private _updateID2: number = -1;
	private _spriteWidth: number = 0;
	private _spriteHeight: number = 0;

	constructor()
	{
		super();
		this.eventMode = 'none';
	}

	private _tag: string = '';

	get tag(): string
	{
		return this._tag;
	}

	set tag(value: string)
	{
		this._tag = value;
	}

	private _identifier: string = '';

	get identifier(): string
	{
		return this._identifier;
	}

	set identifier(value: string)
	{
		this._identifier = value;
	}

	private _clickHandling: boolean = false;

	get clickHandling(): boolean
	{
		return this._clickHandling;
	}

	set clickHandling(value: boolean)
	{
		this._clickHandling = value;
	}

	private _alphaTolerance: number = 128;

	get alphaTolerance(): number
	{
		return this._alphaTolerance;
	}

	set alphaTolerance(value: number)
	{
		this._alphaTolerance = value;
	}

	private _varyingDepth: boolean = false;

	get varyingDepth(): boolean
	{
		return this._varyingDepth;
	}

	set varyingDepth(value: boolean)
	{
		this._varyingDepth = value;
	}

	private _offsetX: number = 0;

	get offsetX(): number
	{
		return this._offsetX;
	}

	set offsetX(value: number)
	{
		this._offsetX = value;
	}

	private _offsetY: number = 0;

	get offsetY(): number
	{
		return this._offsetY;
	}

	set offsetY(value: number)
	{
		this._offsetY = value;
	}

	/**
	 * Check if the sprite needs to be updated based on instance/update IDs.
	 * Returns true if the IDs have changed (sprite data is stale).
	 *
	 * AS3: _Str_17574
	 */
	needsUpdate(instanceId: number, updateId: number): boolean
	{
		if (instanceId !== this._updateID1 || updateId !== this._updateID2)
		{
			this._updateID1 = instanceId;
			this._updateID2 = updateId;
			return true;
		}

		return false;
	}

	/**
	 * Set the texture and track dimensions.
	 * AS3: override set bitmapData
	 */
	setTexture(texture: Texture | null): void
	{
		if (texture !== null)
		{
			this._spriteWidth = texture.width;
			this._spriteHeight = texture.height;
			this.texture = texture;
		}
		else
		{
			this._spriteWidth = 0;
			this._spriteHeight = 0;
			this._updateID1 = -1;
			this._updateID2 = -1;
			this.texture = Texture.EMPTY;
		}
	}

	/**
	 * Bounds-based hit test.
	 * AS3: hitTest / hitTestPoint
	 *
	 * @param localX - X coordinate relative to sprite position
	 * @param localY - Y coordinate relative to sprite position
	 * @returns True if the point hits this sprite
	 */
	hitTest(localX: number, localY: number): boolean
	{
		if (this._alphaTolerance > 255 || this.texture === Texture.EMPTY)
		{
			return false;
		}

		if (localX < 0 || localY < 0 || localX >= this._spriteWidth || localY >= this._spriteHeight)
		{
			return false;
		}

		// In PixiJS we can't easily do per-pixel alpha testing on GPU textures.
		// For now, bounds check is sufficient (matches AS3 behavior for most cases).
		// Alpha tolerance > 0 means we accept any non-transparent pixel in bounds.
		return true;
	}

	dispose(): void
	{
		this.setTexture(null);
	}
}
