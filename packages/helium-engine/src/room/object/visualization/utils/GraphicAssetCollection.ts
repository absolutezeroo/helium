/**
 * GraphicAssetCollection
 *
 * @see com.sulake.room.object.visualization.utils.GraphicAssetCollection
 *
 * Manages a collection of graphic assets parsed from Nitro JSON asset bundles.
 * Supports palette colorization and reference counting.
 */
import {Texture} from 'pixi.js';
import type {IGraphicAsset} from './IGraphicAsset';
import type {IGraphicAssetCollection} from './IGraphicAssetCollection';
import {GraphicAsset} from './GraphicAsset';
import {GraphicAssetPalette} from './GraphicAssetPalette';

export class GraphicAssetCollection implements IGraphicAssetCollection
{
	private static readonly PALETTE_ASSET_DISPOSE_THRESHOLD: number = 10;

	private _name: string = '';
	private _assets: Map<string, GraphicAsset> = new Map();
	private _palettes: Map<string, GraphicAssetPalette> = new Map();
	private _paletteAssetNames: string[] = [];
	private _textures: Map<string, Texture> = new Map();
	private _referenceCount: number = 0;
	private _lastReferenceTimestamp: number = 0;
	private _disposed: boolean = false;

	get disposed(): boolean
	{
		return this._disposed;
	}

	dispose(): void
	{
		if (this._disposed)
		{
			return;
		}

		this._disposed = true;

		for (const palette of this._palettes.values())
		{
			if (palette !== null)
			{
				palette.dispose();
			}
		}

		this._palettes.clear();
		this.disposePaletteAssets();

		for (const asset of this._assets.values())
		{
			if (asset !== null)
			{
				asset.recycle();
			}
		}

		this._assets.clear();
		this._textures.clear();
	}

	addReference(): void
	{
		this._referenceCount++;
		this._lastReferenceTimestamp = Date.now();
	}

	removeReference(): void
	{
		this._referenceCount--;

		if (this._referenceCount <= 0)
		{
			this._referenceCount = 0;
			this._lastReferenceTimestamp = Date.now();
			this.disposePaletteAssets(false);
		}
	}

	getReferenceCount(): number
	{
		return this._referenceCount;
	}

	getLastReferenceTimestamp(): number
	{
		return this._lastReferenceTimestamp;
	}

	/**
	 * Define assets from a Nitro JSON asset bundle.
	 *
	 * Expected data format (from Nitro bundles):
	 * ```json
	 * {
	 *   "assets": { "name": { "source": "...", "x": 0, "y": 0, "flipH": 1, "flipV": 0, "usesPalette": 0 } },
	 *   "palettes": { "id": { "source": "...", "color1": "FFFFFF", "color2": "FFFFFF" } }
	 * }
	 * ```
	 */
	define(data: Record<string, unknown>): boolean
	{
		if (data === null)
		{
			return false;
		}

		const palettes = (data['palettes'] ?? null) as Record<string, Record<string, unknown>> | null;

		if (palettes)
		{
			this.definePalettes(palettes);
		}

		const assets = (data['assets'] ?? null) as Record<string, Record<string, unknown>> | null;

		if (!assets)
		{
			return false;
		}

		this.defineAssets(assets);

		return true;
	}

	getAsset(name: string): IGraphicAsset | null
	{
		const existing = this._assets.get(name);

		if (existing)
		{
			return existing;
		}

		return null;
	}

	getAssetWithPalette(name: string, paletteName: string): IGraphicAsset | null
	{
		const key = name + '@' + paletteName;
		let asset = this.getAsset(key);

		if (asset === null)
		{
			const original = this.getAsset(name);

			if (original === null || !original.usesPalette)
			{
				return original;
			}

			const palette = this._palettes.get(paletteName);

			if (!palette)
			{
				return original;
			}

			// For palette colorization, we would need to create a new texture
			// by applying the palette to the original texture's pixels.
			// For now, return the original asset as palette support requires
			// canvas-based pixel manipulation at runtime.
			const libraryKey = original.libraryAssetName + '@' + paletteName;
			let palettizedTexture: Texture | null = this._textures.get(libraryKey) ?? null;

			if (!palettizedTexture && original.texture)
			{
				palettizedTexture = this.colorizePalette(original.texture, palette);

				if (palettizedTexture)
				{
					this._textures.set(libraryKey, palettizedTexture);
				}
			}

			if (palettizedTexture)
			{
				this._paletteAssetNames.push(key);

				const paletteAsset = GraphicAsset.allocate(
					key,
					libraryKey,
					palettizedTexture,
					original.flipH,
					original.flipV,
					original.originalOffsetX,
					original.originalOffsetY,
					false
				);

				this._assets.set(key, paletteAsset);
				asset = paletteAsset;
			}
		}

		return asset;
	}

	getPaletteNames(): string[]
	{
		return Array.from(this._palettes.keys());
	}

	getPaletteColors(paletteName: string): [number, number] | null
	{
		const palette = this._palettes.get(paletteName);

		if (palette !== null && palette !== undefined)
		{
			return [palette.primaryColor, palette.secondaryColor];
		}

		return null;
	}

	addAsset(
		name: string,
		texture: Texture,
		override: boolean,
		offsetX: number = 0,
		offsetY: number = 0,
		flipH: boolean = false,
		flipV: boolean = false
	): boolean
	{
		if (name === null || texture === null)
		{
			return false;
		}

		const existing = this._textures.get(name);

		if (!existing)
		{
			this._textures.set(name, texture);

			return this.createAsset(name, name, texture, flipH, flipV, offsetX, offsetY, false);
		}

		if (override)
		{
			this._textures.set(name, texture);
			return true;
		}

		return false;
	}

	disposeAsset(name: string): void
	{
		const asset = this._assets.get(name);

		if (asset !== null && asset !== undefined)
		{
			this._assets.delete(name);
			this._textures.delete(asset.libraryAssetName);
			asset.recycle();
		}
	}

	/**
	 * Define assets from Nitro JSON spritesheet data and register textures.
	 *
	 * @param textures Textures from spritesheet (keys prefixed with libraryName)
	 * @param assetData Asset definitions from bundle JSON
	 * @param libraryName The library/collection name used to prefix texture lookups
	 */
	defineFromSpritesheet(
		textures: Map<string, Texture>,
		assetData: Record<string, Record<string, unknown>>,
		libraryName: string = ''
	): void
	{
		this._name = libraryName;

		for (const [name, texture] of textures)
		{
			this._textures.set(name, texture);
		}

		if (assetData)
		{
			this.defineAssets(assetData);
		}
	}

	private defineAssets(assets: Record<string, Record<string, unknown>>): void
	{
		for (const name in assets)
		{
			if (name.length === 0)
			{
				continue;
			}

			const assetDef = assets[name];
			let source = (assetDef['source'] as string) || '';
			const flipH = ((assetDef['flipH'] as number) || 0) > 0 && source.length > 0;
			const flipV = ((assetDef['flipV'] as number) || 0) > 0 && source.length > 0;
			const usesPalette = ((assetDef['usesPalette'] as number) || 0) !== 0;
			const offsetX = -((assetDef['x'] as number) || 0);
			const offsetY = -((assetDef['y'] as number) || 0);

			if (source.length === 0)
			{
				source = name;
			}

			// Nitro bundle spritesheet frames are prefixed with the library name:
			// e.g., frame = "table_silo_med_table_silo_med_64_a_0_0"
			// while asset source = "table_silo_med_64_a_0_0"
			// So we prepend the library name when looking up textures.
			let textureName = source;

			if (this._name.length > 0)
			{
				textureName = this._name + '_' + source;
			}

			const texture = this._textures.get(textureName) || this._textures.get(source) || null;

			if (texture !== null)
			{
				if (!this.createAsset(name, source, texture, flipH, flipV, offsetX, offsetY, usesPalette))
				{
					const existing = this.getAsset(name);

					if (existing !== null && existing.assetName !== existing.libraryAssetName)
					{
						this.replaceAsset(name, source, texture, flipH, flipV, offsetX, offsetY, usesPalette);
					}
				}
			}
		}
	}

	private definePalettes(palettes: Record<string, Record<string, unknown>>): void
	{
		for (const id in palettes)
		{
			if (this._palettes.has(id))
			{
				continue;
			}

			const paletteDef = palettes[id];
			const source = paletteDef['source'] as string;

			if (!source)
			{
				continue;
			}

			// In Nitro bundles, palette data comes as an array of RGB values
			const paletteData = (paletteDef['rgb'] ?? null) as number[] | null;

			if (!paletteData)
			{
				continue;
			}

			let primaryColor = 0xFFFFFF;
			let secondaryColor = 0xFFFFFF;

			const color1 = paletteDef['color1'] as string;

			if (color1 && color1.length > 0)
			{
				primaryColor = parseInt(color1, 16);
				secondaryColor = primaryColor;
			}

			const color2 = paletteDef['color2'] as string;

			if (color2 && color2.length > 0)
			{
				secondaryColor = parseInt(color2, 16);
			}

			const bytes = new Uint8Array(paletteData);
			const palette = new GraphicAssetPalette(bytes, primaryColor, secondaryColor);

			this._palettes.set(id, palette);
		}
	}

	private createAsset(
		name: string,
		libraryName: string,
		texture: Texture,
		flipH: boolean,
		flipV: boolean,
		offsetX: number,
		offsetY: number,
		usesPalette: boolean
	): boolean
	{
		if (this._assets.has(name))
		{
			return false;
		}

		const asset = GraphicAsset.allocate(name, libraryName, texture, flipH, flipV, offsetX, offsetY, usesPalette);
		this._assets.set(name, asset);

		return true;
	}

	private replaceAsset(
		name: string,
		libraryName: string,
		texture: Texture,
		flipH: boolean,
		flipV: boolean,
		offsetX: number,
		offsetY: number,
		usesPalette: boolean
	): boolean
	{
		const existing = this._assets.get(name);

		if (existing)
		{
			this._assets.delete(name);
			existing.recycle();
		}

		return this.createAsset(name, libraryName, texture, flipH, flipV, offsetX, offsetY, usesPalette);
	}

	private colorizePalette(texture: Texture, palette: GraphicAssetPalette): Texture | null
	{
		try
		{
			const canvas = document.createElement('canvas');
			const w = texture.width;
			const h = texture.height;

			canvas.width = w;
			canvas.height = h;

			const ctx = canvas.getContext('2d');

			if (!ctx)
			{
				return null;
			}

			// Draw original texture to canvas
			const source = texture.source;

			if (source && source.resource)
			{
				ctx.drawImage(source.resource as CanvasImageSource, 0, 0);
			}
			else
			{
				return null;
			}

			const imageData = ctx.getImageData(0, 0, w, h);
			palette.colorizePixels(imageData);
			ctx.putImageData(imageData, 0, 0);

			return Texture.from(canvas);
		}
		catch
		{
			return null;
		}
	}

	private disposePaletteAssets(force: boolean = true): void
	{
		if (this._paletteAssetNames !== null)
		{
			if (force || this._paletteAssetNames.length > GraphicAssetCollection.PALETTE_ASSET_DISPOSE_THRESHOLD)
			{
				for (const name of this._paletteAssetNames)
				{
					this.disposeAsset(name);
				}

				this._paletteAssetNames = [];
			}
		}
	}
}
