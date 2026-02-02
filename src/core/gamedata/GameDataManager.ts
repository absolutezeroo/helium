import {Component, type IContext} from '@core/runtime';
import {Logger} from '@core/utils/Logger';
import type {
	IEffectData,
	IFurnitureData,
	IGameDataManager,
	IGameDataUrls,
	IProductData,
} from './IGameDataManager';
import {FurnitureType} from './IGameDataManager';

const log = Logger.getLogger('GameData');

/**
 * Events emitted by GameDataManager
 */
export interface GameDataEvents
{
	ready: [];
	error: [error: Error];
	furnitureLoaded: [];
	effectsLoaded: [];
	productsLoaded: [];
}

/**
 * Manages game data loaded from JSON files
 *
 * Handles FurnitureData, EffectMap, ProductData, FigureData, and other
 * game configuration files.
 *
 * @see source_nitro_renderer/nitro/session/SessionDataManager.ts
 * @see source_nitro_renderer/nitro/session/furniture/FurnitureDataLoader.ts
 */
export class GameDataManager extends Component implements IGameDataManager
{
	constructor(context: IContext)
	{
		super(context);
	}

	protected override initComponent(): void
	{
		log.debug('GameDataManager initialized');
	}

	private _floorItems: Map<number, IFurnitureData> = new Map();
	private _wallItems: Map<number, IFurnitureData> = new Map();
	private _furnitureByClassName: Map<string, IFurnitureData> = new Map();
	private _effects: Map<string, IEffectData> = new Map();
	private _products: Map<string, IProductData> = new Map();
	private _isLoaded = false;

	async loadGameData(urls: IGameDataUrls): Promise<boolean>
	{
		try
		{
			const promises: Promise<void>[] = [];

			if (urls.furnitureDataUrl)
			{
				promises.push(this.loadFurnitureData(urls.furnitureDataUrl));
			}

			if (urls.effectMapUrl)
			{
				promises.push(this.loadEffectMap(urls.effectMapUrl));
			}

			if (urls.productDataUrl)
			{
				promises.push(this.loadProductData(urls.productDataUrl));
			}

			await Promise.all(promises);

			this._isLoaded = true;
			this.events.emit('ready');
			log.success('Game data loaded successfully');

			return true;
		}
		catch (error)
		{
			log.error('Failed to load game data:', error);
			this.events.emit('error', error as Error);
			return false;
		}
	}

	private async loadFurnitureData(url: string): Promise<void>
	{
		const response = await fetch(url);

		if (!response.ok)
		{
			throw new Error(`Failed to load furniture data: ${response.status}`);
		}

		const data = await response.json();

		if (data.roomitemtypes?.furnitype)
		{
			this.parseFloorItems(data.roomitemtypes.furnitype);
		}

		if (data.wallitemtypes?.furnitype)
		{
			this.parseWallItems(data.wallitemtypes.furnitype);
		}

		log.info(`Loaded ${this._floorItems.size} floor items, ${this._wallItems.size} wall items`);
		this.events.emit('furnitureLoaded');
	}

	private parseFloorItems(items: unknown[]): void
	{
		for (const item of items)
		{
			const furni = item as Record<string, unknown>;
			if (!furni) continue;

			const colors = this.parseColors(furni.partcolors);
			const classnameParts = String(furni.classname || '').split('*');
			const className = classnameParts[0];

			const furniture: IFurnitureData = {
				id: Number(furni.id),
				type: FurnitureType.FLOOR,
				classname: String(furni.classname || ''),
				className,
				category: String(furni.category || ''),
				name: String(furni.name || ''),
				description: String(furni.description || ''),
				revision: Number(furni.revision || 0),
				xdim: Number(furni.xdim || 1),
				ydim: Number(furni.ydim || 1),
				colors,
				offerid: Number(furni.offerid || -1),
				buyout: Boolean(furni.buyout),
				rentofferid: Number(furni.rentofferid || -1),
				rentbuyout: Boolean(furni.rentbuyout),
				bc: Boolean(furni.bc),
				specialtype: Number(furni.specialtype || 0),
				canstandon: Boolean(furni.canstandon),
				cansiton: Boolean(furni.cansiton),
				canlayon: Boolean(furni.canlayon),
				excludeddynamic: Boolean(furni.excludeddynamic),
				furniline: String(furni.furniline || ''),
				environment: String(furni.environment || ''),
				rare: Boolean(furni.rare),
			};

			this._floorItems.set(furniture.id, furniture);
			this._furnitureByClassName.set(className, furniture);
		}
	}

	private parseWallItems(items: unknown[]): void
	{
		for (const item of items)
		{
			const furni = item as Record<string, unknown>;
			if (!furni) continue;

			const furniture: IFurnitureData = {
				id: Number(furni.id),
				type: FurnitureType.WALL,
				classname: String(furni.classname || ''),
				className: String(furni.classname || ''),
				category: String(furni.category || ''),
				name: String(furni.name || ''),
				description: String(furni.description || ''),
				revision: Number(furni.revision || 0),
				xdim: 0,
				ydim: 0,
				colors: [],
				offerid: Number(furni.offerid || -1),
				buyout: Boolean(furni.buyout),
				rentofferid: Number(furni.rentofferid || -1),
				rentbuyout: Boolean(furni.rentbuyout),
				bc: Boolean(furni.bc),
				specialtype: Number(furni.specialtype || 0),
				canstandon: false,
				cansiton: false,
				canlayon: false,
				excludeddynamic: Boolean(furni.excludeddynamic),
				furniline: String(furni.furniline || ''),
				environment: String(furni.environment || ''),
				rare: Boolean(furni.rare),
			};

			this._wallItems.set(furniture.id, furniture);
			this._furnitureByClassName.set(furniture.className, furniture);
		}
	}

	private parseColors(partcolors: unknown): number[]
	{
		const colors: number[] = [];

		if (!partcolors || typeof partcolors !== 'object') return colors;

		const pc = partcolors as {color?: unknown[]};
		if (!pc.color) return colors;

		for (const color of pc.color)
		{
			let colorCode = String(color);

			if (colorCode.startsWith('#'))
			{
				colorCode = colorCode.substring(1);
			}

			colors.push(parseInt(colorCode, 16));
		}

		return colors;
	}

	private async loadEffectMap(url: string): Promise<void>
	{
		const response = await fetch(url);

		if (!response.ok)
		{
			throw new Error(`Failed to load effect map: ${response.status}`);
		}

		const data = await response.json();

		if (data.effects)
		{
			for (const effect of data.effects)
			{
				const effectData: IEffectData = {
					id: String(effect.id),
					lib: String(effect.lib || ''),
					type: String(effect.type || ''),
					revision: Number(effect.revision || 0),
				};

				this._effects.set(effectData.id, effectData);
			}
		}

		log.info(`Loaded ${this._effects.size} effects`);
		this.events.emit('effectsLoaded');
	}

	private async loadProductData(url: string): Promise<void>
	{
		const response = await fetch(url);

		if (!response.ok)
		{
			throw new Error(`Failed to load product data: ${response.status}`);
		}

		const data = await response.json();

		if (data.productdata?.product)
		{
			for (const product of data.productdata.product)
			{
				const productData: IProductData = {
					code: String(product.code || ''),
					name: String(product.name || ''),
					description: String(product.description || ''),
				};

				this._products.set(productData.code, productData);
			}
		}

		log.info(`Loaded ${this._products.size} products`);
		this.events.emit('productsLoaded');
	}

	getFurnitureData(id: number): IFurnitureData | null
	{
		return this._floorItems.get(id) ?? this._wallItems.get(id) ?? null;
	}

	getFurnitureDataByClassName(className: string): IFurnitureData | null
	{
		return this._furnitureByClassName.get(className) ?? null;
	}

	getEffectData(id: string): IEffectData | null
	{
		return this._effects.get(id) ?? null;
	}

	getProductData(code: string): IProductData | null
	{
		return this._products.get(code) ?? null;
	}

	get isLoaded(): boolean
	{
		return this._isLoaded;
	}

	get floorItems(): Map<number, IFurnitureData>
	{
		return this._floorItems;
	}

	get wallItems(): Map<number, IFurnitureData>
	{
		return this._wallItems;
	}

	get effects(): Map<string, IEffectData>
	{
		return this._effects;
	}
}
