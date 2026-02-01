/**
 * Game data types and interfaces
 *
 * @see source_nitro_renderer/api/nitro/session/IFurnitureData.ts
 * @see source_nitro_renderer/nitro/session/furniture/FurnitureDataLoader.ts
 */

/**
 * Furniture type enum
 */
export enum FurnitureType
{
	FLOOR = 'S',
	WALL = 'I',
}

/**
 * Furniture data from FurnitureData.json
 */
export interface IFurnitureData
{
	id: number;
	type: FurnitureType;
	classname: string;
	className: string;
	category: string;
	name: string;
	description: string;
	revision: number;
	xdim: number;
	ydim: number;
	colors: number[];
	offerid: number;
	buyout: boolean;
	rentofferid: number;
	rentbuyout: boolean;
	bc: boolean;
	specialtype: number;
	canstandon: boolean;
	cansiton: boolean;
	canlayon: boolean;
	excludeddynamic: boolean;
	furniline: string;
	environment: string;
	rare: boolean;
}

/**
 * Effect data from EffectMap.json
 */
export interface IEffectData
{
	id: string;
	lib: string;
	type: string;
	revision: number;
}

/**
 * Product data from ProductData.json
 */
export interface IProductData
{
	code: string;
	name: string;
	description: string;
}

/**
 * Figure set data from FigureData.json
 */
export interface IFigureSetData
{
	type: string;
	paletteId: number;
	parts: IFigurePartData[];
}

export interface IFigurePartData
{
	id: number;
	type: string;
	colorable: boolean;
	selectable: boolean;
	preselectable: boolean;
	gender: string;
	colors: number[];
}

/**
 * Figure map data from FigureMap.json
 */
export interface IFigureMapData
{
	libraries: IFigureMapLibrary[];
}

export interface IFigureMapLibrary
{
	id: string;
	revision: number;
	parts: IFigureMapPart[];
}

export interface IFigureMapPart
{
	id: number;
	type: string;
}

/**
 * Game data manager interface
 */
export interface IGameDataManager
{
	/**
	 * Load all game data from URLs
	 */
	loadGameData(urls: IGameDataUrls): Promise<boolean>;

	/**
	 * Get furniture data by ID
	 */
	getFurnitureData(id: number): IFurnitureData | null;

	/**
	 * Get furniture data by classname
	 */
	getFurnitureDataByClassName(className: string): IFurnitureData | null;

	/**
	 * Get effect data by ID
	 */
	getEffectData(id: string): IEffectData | null;

	/**
	 * Get product data by code
	 */
	getProductData(code: string): IProductData | null;

	/**
	 * Check if game data is loaded
	 */
	readonly isLoaded: boolean;

	/**
	 * All floor furniture items
	 */
	readonly floorItems: Map<number, IFurnitureData>;

	/**
	 * All wall furniture items
	 */
	readonly wallItems: Map<number, IFurnitureData>;

	/**
	 * All effects
	 */
	readonly effects: Map<string, IEffectData>;
}

/**
 * URLs for loading game data
 */
export interface IGameDataUrls
{
	furnitureDataUrl?: string;
	effectMapUrl?: string;
	productDataUrl?: string;
	figureDataUrl?: string;
	figureMapUrl?: string;
	externalTextsUrl?: string;
}
