import type {IAsset} from './IAsset';
import type {AssetTypeDeclaration} from './AssetTypeDeclaration';

/**
 * SoundAsset
 *
 * Based on AS3: com.sulake.core.assets.SoundAsset
 *
 * Asset that holds audio content. Uses Web Audio API AudioBuffer.
 */
export class SoundAsset implements IAsset
{
	private _disposed: boolean = false;
	private _content: AudioBuffer | null = null;
	private readonly _declaration: AssetTypeDeclaration;
	private readonly _url: string;

	constructor(declaration: AssetTypeDeclaration, url: string = '')
	{
		this._declaration = declaration;
		this._url = url;
	}

	get url(): string
	{
		return this._url;
	}

	get content(): AudioBuffer | null
	{
		return this._content;
	}

	get disposed(): boolean
	{
		return this._disposed;
	}

	get declaration(): AssetTypeDeclaration
	{
		return this._declaration;
	}

	dispose(): void
	{
		if (!this._disposed)
		{
			this._disposed = true;
			this._content = null;
		}
	}

	setUnknownContent(content: unknown): void
	{
		if (content instanceof AudioBuffer)
		{
			this._content = content;
			return;
		}

		if (content instanceof SoundAsset)
		{
			this._content = content._content;
			return;
		}
	}

	setFromOtherAsset(asset: IAsset): void
	{
		if (asset instanceof SoundAsset)
		{
			this._content = asset._content;
			return;
		}

		throw new Error('Provided asset is not of type SoundAsset');
	}

	setParamsDesc(_params: Map<string, string>): void
	{
	}
}
