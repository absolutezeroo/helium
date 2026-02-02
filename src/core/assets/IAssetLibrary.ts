import type {Texture} from 'pixi.js';
import type {IDisposable} from '@core/runtime/IDisposable';

/**
 * Asset data structure from .nitro bundle JSON
 *
 * @see source_nitro_renderer/api/asset/IAssetData.ts
 */
export interface IAssetData
{
	name: string;
	type?: string;
	spritesheet?: ISpritesheetData;
	assets?: Record<string, IAssetInfo>;
	aliases?: Record<string, IAssetAlias>;
}

export interface ISpritesheetData
{
	meta: {
		image: string;
		size: {w: number; h: number};
		scale: number;
	};
	frames: Record<string, IFrameData>;
}

export interface IFrameData
{
	frame: {x: number; y: number; w: number; h: number};
	rotated: boolean;
	trimmed: boolean;
	spriteSourceSize: {x: number; y: number; w: number; h: number};
	sourceSize: {w: number; h: number};
}

export interface IAssetInfo
{
	name: string;
	x?: number;
	y?: number;
	flipH?: boolean;
	flipV?: boolean;
	source?: string;
}

export interface IAssetAlias
{
	link: string;
	flipH?: boolean;
	flipV?: boolean;
}

/**
 * Graphic asset for rendering
 */
export interface IGraphicAsset
{
	name: string;
	texture: Texture;
	x: number;
	y: number;
	flipH: boolean;
	flipV: boolean;
}

/**
 * Collection of related assets from a single bundle
 */
export interface IAssetCollection extends IDisposable
{
	name: string;
	textures: Map<string, Texture>;
	getAsset(name: string): IGraphicAsset | null;
	getTexture(name: string): Texture | null;
}

/**
 * Asset library for managing .nitro bundles and textures
 *
 * @see source_nitro_renderer/api/asset/IAssetManager.ts
 */
export interface IAssetLibrary
{
	/**
	 * Get a texture by name
	 */
	getTexture(name: string): Texture | null;

	/**
	 * Store a texture by name
	 */
	setTexture(name: string, texture: Texture): void;

	/**
	 * Get a graphic asset by name (searches all collections)
	 */
	getAsset(name: string): IGraphicAsset | null;

	/**
	 * Get a collection by name
	 */
	getCollection(name: string): IAssetCollection | null;

	/**
	 * Download and parse a .nitro bundle from URL
	 */
	downloadAsset(url: string): Promise<boolean>;

	/**
	 * Download multiple assets
	 */
	downloadAssets(urls: string[]): Promise<boolean>;

	/**
	 * All loaded collections
	 */
	readonly collections: Map<string, IAssetCollection>;
}
