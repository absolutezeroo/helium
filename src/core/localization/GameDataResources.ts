import type {IGameDataResources} from './IGameDataResources';

interface HashEntry
{
	name: string;
	url: string;
	hash: string;
}

interface HashesData
{
	hashes: HashEntry[];
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
		const parsed: HashesData = JSON.parse(data);
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

	isValid(): boolean
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

	getExternalTextsUrl(): string
	{
		return this._externalTextsUrl;
	}

	getExternalTextsHash(): string
	{
		return this._externalTextsHash;
	}

	getExternalVariablesUrl(): string
	{
		return this._externalVariablesUrl;
	}

	getExternalVariablesHash(): string
	{
		return this._externalVariablesHash;
	}

	getFurniDataUrl(): string
	{
		return this._furniDataUrl;
	}

	getFurniDataHash(): string
	{
		return this._furniDataHash;
	}

	getProductDataUrl(): string
	{
		return this._productDataUrl;
	}

	getProductDataHash(): string
	{
		return this._productDataHash;
	}
}
