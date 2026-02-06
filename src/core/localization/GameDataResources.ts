import type {IGameDataResources} from './IGameDataResources';

interface IHashEntry
{
	name: string;
	url: string;
	hash: string;
}

interface IHashesData
{
	hashes: IHashEntry[];
}

/**
 * Game data resources containing hashes for external files
 *
 * Based on AS3 com.sulake.core.localization.class_50
 */
export class GameDataResources implements IGameDataResources
{
	private _externalTextsUrl: string = '';
	private _externalTextsHash: string = '';
	private _externalVariablesUrl: string = '';
	private _externalVariablesHash: string = '';
	private _furniDataUrl: string = '';
	private _furniDataHash: string = '';
	private _productDataUrl: string = '';
	private _productDataHash: string = '';

	/**
	 * Parse game data resources from JSON string
	 */
	static parse(data: string): GameDataResources
	{
		let parsed: IHashesData;
		try {
  			parsed = JSON.parse(data);
		} catch (_parseError: unknown) {
		  // SC-005: JSON.parse validation
		  throw new Error(`Invalid JSON: ${(_parseError as Error).message}`); // cast: type assertion required
		}
		const resources = new GameDataResources();

		for (const entry of parsed.hashes)
		{
			switch (entry.name)
			{
				case 'external_texts':
					resources._externalTextsUrl = entry.url;
					resources._externalTextsHash = entry.hash;
					break;
				case 'external_variables':
					resources._externalVariablesUrl = entry.url;
					resources._externalVariablesHash = entry.hash;
					break;
				case 'habbo_avatar_actions':
					resources._furniDataUrl = entry.url;
					resources._furniDataHash = entry.hash;
					break;
				case 'product_data':
					resources._productDataUrl = entry.url;
					resources._productDataHash = entry.hash;
					break;
			}
		}

		return resources;
	}

	public isValid(): boolean
	{
		return !!(
			this._externalTextsUrl &&
			this._externalTextsHash &&
			this._externalVariablesUrl &&
			this._externalVariablesHash &&
			this._furniDataUrl &&
			this._furniDataHash &&
			this._productDataUrl &&
			this._productDataHash
		);
	}

	public getExternalTextsUrl(): string
	{
		return this._externalTextsUrl;
	}

	public getExternalTextsHash(): string
	{
		return this._externalTextsHash;
	}

	public getExternalVariablesUrl(): string
	{
		return this._externalVariablesUrl;
	}

	public getExternalVariablesHash(): string
	{
		return this._externalVariablesHash;
	}

	public getFurniDataUrl(): string
	{
		return this._furniDataUrl;
	}

	public getFurniDataHash(): string
	{
		return this._furniDataHash;
	}

	public getProductDataUrl(): string
	{
		return this._productDataUrl;
	}

	public getProductDataHash(): string
	{
		return this._productDataHash;
	}
}
