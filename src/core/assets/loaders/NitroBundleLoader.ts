import {Assets, Spritesheet, Texture} from 'pixi.js';
import { Logger } from '@core/utils/Logger';
import {BinaryFileLoader} from './BinaryFileLoader';

/**
 * Nitro bundle asset data interface
 */
export interface IAssetData
{
	type?: string;
	name?: string;
	visualizationType?: string;
	logicType?: string;
	spritesheet?: ISpritesheetData;
	assets?: Record<string, IAssetInfo>;
	aliases?: Record<string, IAssetAlias>;

	[key: string]: unknown;
}

/**
 * Spritesheet data structure
 */
export interface ISpritesheetData
{
	meta?: {
		image?: string;
		format?: string;
		size?: { w: number; h: number };
		scale?: string;
	};
	frames?: Record<string, IFrameInfo>;
}

/**
 * Frame info for spritesheet
 */
export interface IFrameInfo
{
	frame: { x: number; y: number; w: number; h: number };
	rotated?: boolean;
	trimmed?: boolean;
	spriteSourceSize?: { x: number; y: number; w: number; h: number };
	sourceSize?: { w: number; h: number };
}

/**
 * Asset info from bundle
 */
export interface IAssetInfo
{
	source?: string;
	x?: number;
	y?: number;
	flipH?: boolean;
	flipV?: boolean;
	usesPalette?: boolean;
}

/**
 * Asset alias reference
 */
export interface IAssetAlias
{
	link: string;
	flipH?: boolean;
	flipV?: boolean;
}

/**
 * NitroBundleLoader
 *
 * Custom loader for Nitro bundle files (.nitro).
 *
 * Nitro bundles are a custom format containing:
 * - JSON manifest with asset data
 * - PNG spritesheet(s)
 *
 * The format is a simple binary structure:
 * - 4 bytes: number of files
 * - For each file:
 *   - 2 bytes: filename length
 *   - N bytes: filename (UTF-8)
 *   - 4 bytes: file data length
 *   - N bytes: file data
 */
export class NitroBundleLoader extends BinaryFileLoader
{
	/**
	 * Whether ownership of textures has been transferred to an asset
	 */
	private _ownershipTransferred: boolean = false;

	constructor(mimeType: string, url?: string, id: number = -1)
	{
		super(mimeType, url, id);
	}

	private _jsonData: IAssetData | null = null;

	/**
	 * The parsed JSON data from the bundle
	 */
	get jsonData(): IAssetData | null
	{
		return this._jsonData;
	}

	private _textures: Map<string, Texture> = new Map();

	/**
	 * The extracted textures (individual sprites from spritesheet)
	 */
	get textures(): Map<string, Texture>
	{
		return this._textures;
	}

	private _spritesheet: Spritesheet | null = null;

	/**
	 * The spritesheet if available
	 */
	get spritesheet(): Spritesheet | null
	{
		return this._spritesheet;
	}

	private _baseTexture: Texture | null = null;

	/**
	 * The base texture (original PNG)
	 */
	get baseTexture(): Texture | null
	{
		return this._baseTexture;
	}

	/**
	 * The loaded content (returns the JSON data)
	 */
	override get content(): unknown
	{
		return this._jsonData;
	}

	/**
	 * Get a texture by name
	 */
	public getTexture(name: string): Texture | null
	{
		return this._textures.get(name) || this._baseTexture;
	}

	/**
	 * Transfer ownership of textures to an asset.
	 * After calling this, dispose() will NOT destroy the textures.
	 * The receiving asset is responsible for destroying them.
	 */
	public transferOwnership(): void
	{
		this._ownershipTransferred = true;
	}

	/**
	 * Dispose of this loader
	 */
	override dispose(): void
	{
		if (!this._disposed)
		{
			this._jsonData = null;

			// Only destroy textures if ownership wasn't transferred
			if (!this._ownershipTransferred)
			{
				// Spritesheet disposal handles its textures
				if (this._spritesheet)
				{
					this._spritesheet.destroy(true);
					this._spritesheet = null;
				} else if (this._baseTexture)
				{
					this._baseTexture.destroy(true);
				}

				this._baseTexture = null;
				this._textures.clear();
			} else
			{
				// Clear references without destroying
				this._spritesheet = null;
				this._baseTexture = null;
				this._textures.clear();
			}

			super.dispose();
		}
	}

	/**
	 * Override to parse bundle after loading
	 */
	protected override handleLoadEvent(type: string, httpStatus?: number): void
	{
		if (type === 'complete' && this._data)
		{
			this.parseBundle().then(() =>
			{
				super.handleLoadEvent('complete', httpStatus);
			}).catch((error) =>
			{
				Logger.error('[NitroBundleLoader] Error parsing bundle:', error);

				super.handleLoadEvent('ioError', httpStatus);
			});

			return;
		}

		super.handleLoadEvent(type, httpStatus);
	}

	/**
	 * Parse the nitro bundle format
	 */
	private async parseBundle(): Promise<void>
	{
		if (!this._data)
		{
			throw new Error('No data to parse');
		}

		const files = this.extractFiles(this._data);

		// Find and parse the JSON file
		const jsonFile = files.find(f => f.name.endsWith('.json'));

		if (!jsonFile)
		{
			throw new Error('No JSON file found in bundle');
		}

		const decoder = new TextDecoder('utf-8');
		const jsonString = decoder.decode(jsonFile.data);
		try {
  		this._jsonData = JSON.parse(jsonString);
		} catch (_parseError: unknown) {
		  // SC-005: JSON.parse validation
		  throw new Error(`Invalid JSON: ${(_parseError as Error).message}`); // cast: type assertion required
		}

		// Find and load the PNG file(s)
		const pngFile = files.find(f => f.name.endsWith('.png'));

		if (pngFile)
		{
			// Create blob URL for the PNG (cast to BlobPart for TypeScript compatibility)
			const blob = new Blob([new Uint8Array(pngFile.data)], {type: 'image/png'});
			const blobUrl = URL.createObjectURL(blob);

			try
			{
				// Load the texture using PixiJS Assets
				this._baseTexture = await Assets.load<Texture>(blobUrl);

				// If there's spritesheet data, parse it
				if (this._jsonData?.spritesheet?.frames)
				{
					await this.parseSpritesheet();
				}
			} finally
			{
				// Clean up blob URL
				URL.revokeObjectURL(blobUrl);
			}
		}
	}

	/**
	 * Parse spritesheet data and create individual textures
	 */
	private async parseSpritesheet(): Promise<void>
	{
		if (!this._baseTexture || !this._jsonData?.spritesheet)
		{
			return;
		}

		const spritesheetData = this._jsonData.spritesheet;

		// Create PixiJS spritesheet data format
		const pixiSpritesheetData = {
			frames: spritesheetData.frames || {},
			meta: {
				image: '',
				format: spritesheetData.meta?.format || 'RGBA8888',
				size: spritesheetData.meta?.size || {w: this._baseTexture.width, h: this._baseTexture.height},
				scale: spritesheetData.meta?.scale || '1',
			},
		};

		// Create spritesheet
		this._spritesheet = new Spritesheet(this._baseTexture, pixiSpritesheetData);

		await this._spritesheet.parse();

		// Copy textures to our map
		for (const [name, texture] of Object.entries(this._spritesheet.textures))
		{
			this._textures.set(name, texture);
		}
	}

	/**
	 * Extract files from the nitro bundle binary format
	 */
	private extractFiles(data: ArrayBuffer): Array<{ name: string; data: Uint8Array }>
	{
		const files: Array<{ name: string; data: Uint8Array }> = [];
		const view = new DataView(data);

		let offset = 0;

		// Read number of files (4 bytes, big-endian)
		const numFiles = view.getUint32(offset, false);

		offset += 4;

		for (let i = 0; i < numFiles; i++)
		{
			// Read filename length (2 bytes, big-endian)
			const nameLength = view.getUint16(offset, false);

			offset += 2;

			// Read filename
			const nameBytes = new Uint8Array(data, offset, nameLength);
			const name = new TextDecoder('utf-8').decode(nameBytes);

			offset += nameLength;

			// Read file data length (4 bytes, big-endian)
			const dataLength = view.getUint32(offset, false);

			offset += 4;

			// Read file data
			const fileData = new Uint8Array(data, offset, dataLength);

			offset += dataLength;

			files.push({name, data: fileData});
		}

		return files;
	}
}
