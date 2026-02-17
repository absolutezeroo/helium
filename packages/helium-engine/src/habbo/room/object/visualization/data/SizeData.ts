/**
 * SizeData
 *
 * @see com.sulake.habbo.room.object.visualization.data.SizeData
 *
 * Core visualization data per scale. Manages layer count, angle, directions, and colors.
 * Adapted from AS3 XML to Nitro JSON format.
 */
import {ColorData} from './ColorData';
import {DirectionData} from './DirectionData';
import {LayerData} from './LayerData';

export class SizeData
{
	public static readonly LAYER_LIMIT: number = 1000;
	public static readonly DEFAULT_DIRECTION: number = 0;
	private _angle: number = 360;
	private _defaultDirection: DirectionData;
	private _directions: Map<number, DirectionData> = new Map();
	private _colors: Map<string, ColorData> = new Map();
	private _cachedDirection: DirectionData | null = null;
	private _cachedDirectionId: number = -1;

	constructor(layerCount: number, angle: number)
	{
		if (layerCount < 0) layerCount = 0;
		if (layerCount > SizeData.LAYER_LIMIT) layerCount = SizeData.LAYER_LIMIT;

		this._layerCount = layerCount;

		if (angle < 1) angle = 1;
		if (angle > 360) angle = 360;

		this._angle = angle;
		this._defaultDirection = new DirectionData(layerCount);
	}

	private _layerCount: number = 0;

	get layerCount(): number
	{
		return this._layerCount;
	}

	dispose(): void
	{
		if (this._defaultDirection !== null)
		{
			this._defaultDirection.dispose();
		}

		for (const direction of this._directions.values())
		{
			if (direction !== null)
			{
				direction.dispose();
			}
		}

		this._directions.clear();
		this._cachedDirection = null;

		for (const colorData of this._colors.values())
		{
			if (colorData !== null)
			{
				colorData.dispose();
			}
		}

		this._colors.clear();
	}

	/**
	 * Define layer properties from Nitro JSON data.
	 *
	 * JSON format: `{ "layers": { "0": { "tag": "...", "ink": "ADD", "alpha": 128, ... } } }`
	 */
	defineLayers(data: Record<string, unknown>): boolean
	{
		if (data === null || data === undefined)
		{
			return false;
		}

		const layers = data as Record<string, Record<string, unknown>>;

		return this.defineDirection(this._defaultDirection, layers);
	}

	/**
	 * Define direction overrides from Nitro JSON data.
	 *
	 * JSON format: `{ "0": { "layers": { "0": { ... } } }, "2": { ... } }`
	 */
	defineDirections(data: Record<string, unknown>): boolean
	{
		if (data === null || data === undefined)
		{
			return false;
		}

		const directions = data as Record<string, Record<string, unknown>>;

		for (const idStr in directions)
		{
			const dirId = parseInt(idStr);

			if (isNaN(dirId))
			{
				continue;
			}

			if (this._directions.has(dirId))
			{
				return false;
			}

			const directionData = new DirectionData(this._layerCount);
			directionData.copyValues(this._defaultDirection);

			const dirDef = directions[idStr];
			const layers = (dirDef['layers'] ?? null) as Record<string, Record<string, unknown>> | null;

			if (layers)
			{
				this.defineDirection(directionData, layers);
			}

			this._directions.set(dirId, directionData);
			this._cachedDirectionId = -1;
			this._cachedDirection = null;
		}

		return true;
	}

	/**
	 * Define colors from Nitro JSON data.
	 *
	 * JSON format: `{ "1": { "layers": { "0": { "color": "FF0000" }, ... } } }`
	 */
	defineColors(data: Record<string, unknown>): boolean
	{
		if (data === null || data === undefined)
		{
			return true;
		}

		const colors = data as Record<string, Record<string, unknown>>;

		for (const colorId in colors)
		{
			if (this._colors.has(colorId))
			{
				return false;
			}

			const colorDef = colors[colorId];
			const colorData = new ColorData(this._layerCount);
			const layers = (colorDef['layers'] ?? null) as Record<string, Record<string, unknown>> | null;

			if (layers)
			{
				for (const layerId in layers)
				{
					const layerDef = layers[layerId];
					const layerIndex = parseInt(layerId);
					const colorStr = layerDef['color'] as string;

					if (!isNaN(layerIndex) && colorStr)
					{
						const color = parseInt(colorStr, 16);
						colorData.setColor(color, layerIndex);
					}
				}
			}

			this._colors.set(colorId, colorData);
		}

		return true;
	}

	getDirectionValue(direction: number): number
	{
		const normalizedDir = ((direction % 360) + 360 + Math.floor(this._angle / 2)) % 360;
		const dirIndex = Math.floor(normalizedDir / this._angle);

		if (this._directions.has(dirIndex))
		{
			return dirIndex;
		}

		const rawDir = ((direction % 360) + 360) % 360;
		let bestDist = -1;
		let bestIndex = -1;

		const dirKeys = Array.from(this._directions.keys());

		for (let i = 0; i < dirKeys.length; i++)
		{
			const angle = dirKeys[i] * this._angle;
			let dist = (angle - rawDir + 360) % 360;

			if (dist > 180)
			{
				dist = 360 - dist;
			}

			if (dist < bestDist || bestDist < 0)
			{
				bestDist = dist;
				bestIndex = i;
			}
		}

		if (bestIndex >= 0)
		{
			return dirKeys[bestIndex];
		}

		return 0;
	}

	getTag(direction: number, layerIndex: number): string
	{
		const dirData = this.getDirectionData(direction);

		if (dirData !== null)
		{
			return dirData.getTag(layerIndex);
		}

		return LayerData.DEFAULT_TAG;
	}

	getInk(direction: number, layerIndex: number): number
	{
		const dirData = this.getDirectionData(direction);

		if (dirData !== null)
		{
			return dirData.getInk(layerIndex);
		}

		return LayerData.DEFAULT_INK;
	}

	getAlpha(direction: number, layerIndex: number): number
	{
		const dirData = this.getDirectionData(direction);

		if (dirData !== null)
		{
			return dirData.getAlpha(layerIndex);
		}

		return LayerData.DEFAULT_ALPHA;
	}

	getColor(layerIndex: number, colorId: number): number
	{
		const colorData = this._colors.get(String(colorId));

		if (colorData !== null && colorData !== undefined)
		{
			return colorData.getColor(layerIndex);
		}

		return ColorData.DEFAULT_COLOR;
	}

	getIgnoreMouse(direction: number, layerIndex: number): boolean
	{
		const dirData = this.getDirectionData(direction);

		if (dirData !== null)
		{
			return dirData.getIgnoreMouse(layerIndex);
		}

		return LayerData.DEFAULT_IGNORE_MOUSE;
	}

	getXOffset(direction: number, layerIndex: number): number
	{
		const dirData = this.getDirectionData(direction);

		if (dirData !== null)
		{
			return dirData.getXOffset(layerIndex);
		}

		return LayerData.DEFAULT_X_OFFSET;
	}

	getYOffset(direction: number, layerIndex: number): number
	{
		const dirData = this.getDirectionData(direction);

		if (dirData !== null)
		{
			return dirData.getYOffset(layerIndex);
		}

		return LayerData.DEFAULT_Y_OFFSET;
	}

	getZOffset(direction: number, layerIndex: number): number
	{
		const dirData = this.getDirectionData(direction);

		if (dirData !== null)
		{
			return dirData.getZOffset(layerIndex);
		}

		return LayerData.DEFAULT_Z_OFFSET;
	}

	private defineDirection(directionData: DirectionData, layers: Record<string, Record<string, unknown>>): boolean
	{
		if (directionData === null || layers === null)
		{
			return false;
		}

		for (const idStr in layers)
		{
			const layerIndex = parseInt(idStr);

			if (isNaN(layerIndex) || layerIndex < 0 || layerIndex >= this._layerCount)
			{
				continue;
			}

			const layerDef = layers[idStr];

			const tag = (layerDef['tag'] ?? null) as string | null;

			if (tag && tag.length > 0)
			{
				directionData.setTag(layerIndex, tag);
			}

			const ink = (layerDef['ink'] ?? null) as string | null;

			if (ink)
			{
				switch (ink)
				{
					case 'ADD':
						directionData.setInk(layerIndex, LayerData.INK_ADD);
						break;
					case 'SUBTRACT':
						directionData.setInk(layerIndex, LayerData.INK_SUBTRACT);
						break;
					case 'DARKEN':
						directionData.setInk(layerIndex, LayerData.INK_DARKEN);
						break;
					case 'DIFFERENCE':
						directionData.setInk(layerIndex, LayerData.INK_DIFFERENCE);
						break;
					case 'MULTIPLY':
						directionData.setInk(layerIndex, LayerData.INK_MULTIPLY);
						break;
					case 'INVERT':
						directionData.setInk(layerIndex, LayerData.INK_INVERT);
						break;
					case 'SCREEN':
						directionData.setInk(layerIndex, LayerData.INK_SCREEN);
						break;
				}
			}

			const alpha = (layerDef['alpha'] ?? null) as number | null;

			if (alpha !== null)
			{
				directionData.setAlpha(layerIndex, alpha);
			}

			const ignoreMouse = (layerDef['ignoreMouse'] ?? null) as number | null;

			if (ignoreMouse !== null)
			{
				directionData.setIgnoreMouse(layerIndex, ignoreMouse !== 0);
			}

			const x = (layerDef['x'] ?? null) as number | null;

			if (x !== null)
			{
				directionData.setXOffset(layerIndex, x);
			}

			const y = (layerDef['y'] ?? null) as number | null;

			if (y !== null)
			{
				directionData.setYOffset(layerIndex, y);
			}

			const z = (layerDef['z'] ?? null) as number | null;

			if (z !== null)
			{
				directionData.setZOffset(layerIndex, z / -1000);
			}
		}

		return true;
	}

	private getDirectionData(direction: number): DirectionData
	{
		if (direction === this._cachedDirectionId && this._cachedDirection !== null)
		{
			return this._cachedDirection;
		}

		let dirData = this._directions.get(direction) || null;

		if (dirData === null)
		{
			dirData = this._defaultDirection;
		}

		this._cachedDirectionId = direction;
		this._cachedDirection = dirData;

		return this._cachedDirection;
	}
}
