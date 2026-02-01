import {Spritesheet, Texture} from 'pixi.js';
import type {IAssetCollection, IAssetData, IAssetInfo, IGraphicAsset} from './IAssetLibrary';

/**
 * Collection of related graphic assets from a single .nitro bundle
 *
 * @see source_nitro_renderer/api/asset/GraphicAssetCollection.ts
 */
export class AssetCollection implements IAssetCollection
{
	private _name: string;
	private _data: IAssetData;
	private _textures: Map<string, Texture> = new Map();
	private _assets: Map<string, IAssetInfo> = new Map();

	constructor(data: IAssetData, spritesheet: Spritesheet | null)
	{
		this._name = data.name;
		this._data = data;

		// Process spritesheet textures
		if (spritesheet?.textures)
		{
			for (const [name, texture] of Object.entries(spritesheet.textures))
			{
				this._textures.set(name, texture as Texture);
			}
		}

		// Process asset definitions
		if (data.assets)
		{
			for (const [name, info] of Object.entries(data.assets))
			{
				this._assets.set(name, info);
			}
		}
	}

	get name(): string
	{
		return this._name;
	}

	get textures(): Map<string, Texture>
	{
		return this._textures;
	}

	getTexture(name: string): Texture | null
	{
		return this._textures.get(name) ?? null;
	}

	getAsset(name: string): IGraphicAsset | null
	{
		// Check if this is an alias
		if (this._data.aliases?.[name])
		{
			const alias = this._data.aliases[name];
			const linked = this.getAsset(alias.link);

			if (linked)
			{
				return {
					...linked,
					name,
					flipH: alias.flipH ?? linked.flipH,
					flipV: alias.flipV ?? linked.flipV,
				};
			}

			return null;
		}

		// Get asset info
		const assetInfo = this._assets.get(name);
		if (!assetInfo) return null;

		// If asset has a source, get texture from source
		const textureName = assetInfo.source ?? name;
		const texture = this._textures.get(textureName);

		if (!texture) return null;

		return {
			name,
			texture,
			x: assetInfo.x ?? 0,
			y: assetInfo.y ?? 0,
			flipH: assetInfo.flipH ?? false,
			flipV: assetInfo.flipV ?? false,
		};
	}

	dispose(): void
	{
		for (const texture of this._textures.values())
		{
			texture.destroy();
		}

		this._textures.clear();
		this._assets.clear();
	}
}
