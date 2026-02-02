import {Spritesheet, Texture} from 'pixi.js';
import {Component, type IContext} from '@core/runtime';
import {Logger} from '@core/utils/Logger';
import {AssetCollection} from './AssetCollection';
import type {IAssetCollection, IAssetData, IAssetLibrary, IGraphicAsset} from './IAssetLibrary';
import {NitroBundle} from './NitroBundle';

const log = Logger.getLogger('AssetLibrary');

/**
 * Asset library for managing .nitro bundles and textures
 *
 * Handles downloading, parsing, and caching of game assets in the .nitro format.
 * The .nitro format is a binary container with deflate-compressed JSON metadata
 * and PNG textures.
 *
 * @see source_nitro_renderer/api/asset/AssetManager.ts
 */
export class AssetLibrary extends Component implements IAssetLibrary
{
	private _textures: Map<string, Texture> = new Map();
	private _collections: Map<string, IAssetCollection> = new Map();

	constructor(context: IContext)
	{
		super(context);
	}

	protected override initComponent(): void
	{
		log.debug('AssetLibrary initialized');
	}

	getTexture(name: string): Texture | null
	{
		return this._textures.get(name) ?? null;
	}

	setTexture(name: string, texture: Texture): void
	{
		if (!name || !texture) return;
		this._textures.set(name, texture);
	}

	getAsset(name: string): IGraphicAsset | null
	{
		for (const collection of this._collections.values())
		{
			const asset = collection.getAsset(name);
			if (asset) return asset;
		}

		return null;
	}

	getCollection(name: string): IAssetCollection | null
	{
		return this._collections.get(name) ?? null;
	}

	async downloadAsset(url: string): Promise<boolean>
	{
		return this.downloadAssets([url]);
	}

	async downloadAssets(urls: string[]): Promise<boolean>
	{
		if (!urls?.length) return true;

		try
		{
			for (const url of urls)
			{
				const response = await fetch(url);

				if (!response.ok)
				{
					log.warn(`Failed to download asset: ${url} (${response.status})`);
					continue;
				}

				const contentType = response.headers.get('Content-Type') ?? 'application/octet-stream';

				if (contentType === 'application/octet-stream')
				{
					// .nitro bundle
					const buffer = await response.arrayBuffer();
					await this.processNitroBundle(buffer);
				}
				else if (contentType.startsWith('image/'))
				{
					// Direct image
					const buffer = await response.arrayBuffer();
					const base64 = this.arrayBufferToBase64(new Uint8Array(buffer));
					const dataUrl = `data:${contentType};base64,${base64}`;
					const texture = Texture.from(dataUrl);

					this.setTexture(url, texture);
				}
			}

			return true;
		}
		catch (error)
		{
			log.error('Failed to download assets:', error);
			return false;
		}
	}

	private async processNitroBundle(buffer: ArrayBuffer): Promise<void>
	{
		const bundle = new NitroBundle(buffer);
		const data = bundle.jsonData;
		const texture = bundle.texture;

		if (!data)
		{
			log.warn('Nitro bundle has no JSON data');
			return;
		}

		// Create spritesheet if we have texture and spritesheet data
		let spritesheet: Spritesheet | null = null;

		if (texture && data.spritesheet)
		{
			spritesheet = new Spritesheet(texture, data.spritesheet);
			await spritesheet.parse();
		}

		// Create and store collection
		const collection = new AssetCollection(data, spritesheet);

		// Store all textures from collection
		for (const [name, tex] of collection.textures)
		{
			this.setTexture(name, tex);
		}

		this._collections.set(collection.name, collection);
	}

	private arrayBufferToBase64(buffer: Uint8Array): string
	{
		let binary = '';
		const len = buffer.byteLength;

		for (let i = 0; i < len; i++)
		{
			binary += String.fromCharCode(buffer[i]);
		}

		return btoa(binary);
	}

	get collections(): Map<string, IAssetCollection>
	{
		return this._collections;
	}
}
