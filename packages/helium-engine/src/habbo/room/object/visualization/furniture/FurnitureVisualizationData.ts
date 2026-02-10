/**
 * FurnitureVisualizationData
 *
 * @see com.sulake.habbo.room.object.visualization.furniture.FurnitureVisualizationData
 *
 * Implements IRoomObjectVisualizationData for furniture. Manages SizeData per scale.
 * LAYER_NAMES = ['a'..'z']. Parses Nitro JSON visualization data.
 */
import type {IRoomObjectVisualizationData} from '@room/object/visualization/IRoomObjectVisualizationData';
import {SizeData} from '../data/SizeData';

export class FurnitureVisualizationData implements IRoomObjectVisualizationData
{
	public static readonly LAYER_LIMIT: number = 1000;

	public static readonly LAYER_NAMES: string[] = [
		'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
		'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
	];

	private _sizes: Map<number, SizeData> = new Map();
	private _sortedSizes: number[] = [];
	private _cachedSizeData: SizeData | null = null;
	private _cachedSizeId: number = -1;
	private _cachedSize: number = -1;
	private _cachedSizeScale: number = -1;
	private _type: string = '';
	private _disposed: boolean = false;

	get disposed(): boolean
	{
		return this._disposed;
	}

	dispose(): void
	{
		if (this._disposed) return;

		this._disposed = true;

		for (const sizeData of this._sizes.values())
		{
			if (sizeData !== null)
			{
				sizeData.dispose();
			}
		}

		this._sizes.clear();
		this._sortedSizes = [];
		this._cachedSizeData = null;
	}

	/**
	 * Initialize from Nitro JSON asset bundle.
	 *
	 * Expected format:
	 * ```json
	 * {
	 *   "type": "furniture_name",
	 *   "visualizations": [
	 *     { "size": 64, "layerCount": 3, "angle": 45,
	 *       "layers": { ... }, "directions": { ... }, "colors": { ... }, "animations": { ... }
	 *     }
	 *   ]
	 * }
	 * ```
	 */
	initialize(data: unknown): boolean
	{
		this.reset();

		if (data === null || data === undefined)
		{
			return false;
		}

		const vizData = data as Record<string, unknown>;

		// Nitro bundle: 'name' = specific furniture name (e.g. "table_silo_med"),
		// 'type' = generic category (e.g. "furniture"). Use 'name' first.
		const type = (vizData['name'] as string) || (vizData['type'] as string);

		if (!type || type.length === 0)
		{
			return false;
		}

		this._type = type;

		if (!this.defineVisualizations(vizData))
		{
			this.reset();

			return false;
		}

		return true;
	}

	getType(): string
	{
		return this._type;
	}

	getSize(scale: number): number
	{
		if (scale === this._cachedSizeScale)
		{
			return this._cachedSize;
		}

		const index = this.getSizeIndex(scale);

		let size = -1;

		if (index < this._sortedSizes.length)
		{
			size = this._sortedSizes[index];
		}

		this._cachedSizeScale = scale;
		this._cachedSize = size;

		return size;
	}

	getLayerCount(scale: number): number
	{
		const sizeData = this.getSizeData(scale);

		if (sizeData !== null)
		{
			return sizeData.layerCount;
		}

		return 0;
	}

	getDirectionValue(scale: number, direction: number): number
	{
		const sizeData = this.getSizeData(scale);

		if (sizeData !== null)
		{
			return sizeData.getDirectionValue(direction);
		}

		return 0;
	}

	getTag(scale: number, direction: number, layerIndex: number): string
	{
		const sizeData = this.getSizeData(scale);

		if (sizeData !== null)
		{
			return sizeData.getTag(direction, layerIndex);
		}

		return '';
	}

	getInk(scale: number, direction: number, layerIndex: number): number
	{
		const sizeData = this.getSizeData(scale);

		if (sizeData !== null)
		{
			return sizeData.getInk(direction, layerIndex);
		}

		return 0;
	}

	getAlpha(scale: number, direction: number, layerIndex: number): number
	{
		const sizeData = this.getSizeData(scale);

		if (sizeData !== null)
		{
			return sizeData.getAlpha(direction, layerIndex);
		}

		return 255;
	}

	getColor(scale: number, layerIndex: number, colorId: number): number
	{
		const sizeData = this.getSizeData(scale);

		if (sizeData !== null)
		{
			return sizeData.getColor(layerIndex, colorId);
		}

		return 0xFFFFFF;
	}

	getIgnoreMouse(scale: number, direction: number, layerIndex: number): boolean
	{
		const sizeData = this.getSizeData(scale);

		if (sizeData !== null)
		{
			return sizeData.getIgnoreMouse(direction, layerIndex);
		}

		return false;
	}

	getXOffset(scale: number, direction: number, layerIndex: number): number
	{
		const sizeData = this.getSizeData(scale);

		if (sizeData !== null)
		{
			return sizeData.getXOffset(direction, layerIndex);
		}

		return 0;
	}

	getYOffset(scale: number, direction: number, layerIndex: number): number
	{
		const sizeData = this.getSizeData(scale);

		if (sizeData !== null)
		{
			return sizeData.getYOffset(direction, layerIndex);
		}

		return 0;
	}

	getZOffset(scale: number, direction: number, layerIndex: number): number
	{
		const sizeData = this.getSizeData(scale);

		if (sizeData !== null)
		{
			return sizeData.getZOffset(direction, layerIndex);
		}

		return 0;
	}

	protected reset(): void
	{
		this._type = '';

		for (const sizeData of this._sizes.values())
		{
			if (sizeData !== null)
			{
				sizeData.dispose();
			}
		}

		this._sizes.clear();
		this._sortedSizes = [];
		this._cachedSizeData = null;
		this._cachedSizeId = -1;
	}

	protected defineVisualizations(data: Record<string, unknown>): boolean
	{
		const visualizations = data['visualizations'] as Record<string, unknown>[] | undefined;

		if (!visualizations || !Array.isArray(visualizations) || visualizations.length === 0)
		{
			return false;
		}

		for (const vizDef of visualizations)
		{
			let size = (vizDef['size'] as number) || 0;
			const layerCount = (vizDef['layerCount'] as number) || 0;
			const angle = (vizDef['angle'] as number) || 45;

			if (size < 1) size = 1;

			if (this._sizes.has(size))
			{
				return false;
			}

			const sizeData = this.createSizeData(size, layerCount, angle);

			if (sizeData === null)
			{
				return false;
			}

			// Process all visualization elements
			if (!this.processVisualizationElements(sizeData, vizDef))
			{
				sizeData.dispose();
				return false;
			}

			this._sizes.set(size, sizeData);
			this._sortedSizes.push(size);
			this._sortedSizes.sort((a, b) => a - b);
		}

		return true;
	}

	protected createSizeData(_size: number, layerCount: number, angle: number): SizeData
	{
		return new SizeData(layerCount, angle);
	}

	protected processVisualizationElement(sizeData: SizeData, elementName: string, elementData: Record<string, unknown>): boolean
	{
		if (sizeData === null)
		{
			return false;
		}

		switch (elementName)
		{
			case 'layers':
				if (!sizeData.defineLayers(elementData))
				{
					return false;
				}
				break;
			case 'directions':
				if (!sizeData.defineDirections(elementData))
				{
					return false;
				}
				break;
			case 'colors':
				if (!sizeData.defineColors(elementData))
				{
					return false;
				}
				break;
		}

		return true;
	}

	protected getSizeData(scale: number): SizeData | null
	{
		if (scale === this._cachedSizeId)
		{
			return this._cachedSizeData;
		}

		const index = this.getSizeIndex(scale);

		if (index < this._sortedSizes.length)
		{
			this._cachedSizeData = this._sizes.get(this._sortedSizes[index]) || null;
		}
		else
		{
			this._cachedSizeData = null;
		}

		this._cachedSizeId = scale;

		return this._cachedSizeData;
	}

	private processVisualizationElements(sizeData: SizeData, vizDef: Record<string, unknown>): boolean
	{
		const elementNames = ['layers', 'directions', 'colors', 'animations'];

		for (const name of elementNames)
		{
			const elementData = vizDef[name] as Record<string, unknown> | undefined;

			if (elementData)
			{
				if (!this.processVisualizationElement(sizeData, name, elementData))
				{
					return false;
				}
			}
		}

		return true;
	}

	private getSizeIndex(scale: number): number
	{
		let bestIndex = 0;

		if (scale > 0)
		{
			for (let i = 1; i < this._sortedSizes.length; i++)
			{
				if (this._sortedSizes[i] > scale)
				{
					if (this._sortedSizes[i] / scale < scale / this._sortedSizes[i - 1])
					{
						bestIndex = i;
					}

					break;
				}

				bestIndex = i;
			}
		}

		return bestIndex;
	}
}
