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
	private _effectMapUrl: string = '';

	get effectMapUrl(): string
	{
		return this._effectMapUrl;
	}

	private _effectMapHash: string = '';

	get effectMapHash(): string
	{
		return this._effectMapHash;
	}

	private _externalRendererVariablesUrl: string = '';

	get externalRendererVariablesUrl(): string
	{
		return this._externalRendererVariablesUrl;
	}

	private _externalRendererVariablesHash: string = '';

	get externalRendererVariablesHash(): string
	{
		return this._externalRendererVariablesHash;
	}

	private _externalTextsUrl: string = '';

	get externalTextsUrl(): string
	{
		return this._externalTextsUrl;
	}

	private _externalTextsHash: string = '';

	get externalTextsHash(): string
	{
		return this._externalTextsHash;
	}

	private _externalUIVariablesUrl: string = '';

	get externalUIVariablesUrl(): string
	{
		return this._externalUIVariablesUrl;
	}

	private _externalUIVariablesHash: string = '';

	get externalUIVariablesHash(): string
	{
		return this._externalUIVariablesHash;
	}

	private _figureDataUrl: string = '';

	get figureDataUrl(): string
	{
		return this._figureDataUrl;
	}

	private _figureDataHash: string = '';

	get figureDataHash(): string
	{
		return this._figureDataHash;
	}

	private _figureMapUrl: string = '';

	get figureMapUrl(): string
	{
		return this._figureMapUrl;
	}

	private _figureMapHash: string = '';

	get figureMapHash(): string
	{
		return this._figureMapHash;
	}

	private _furnitureDataUrl: string = '';

	get furnitureDataUrl(): string
	{
		return this._furnitureDataUrl;
	}

	private _furnitureDataHash: string = '';

	get furnitureDataHash(): string
	{
		return this._furnitureDataHash;
	}

	private _habboAvatarActionsUrl: string = '';

	get habboAvatarActionsUrl(): string
	{
		return this._habboAvatarActionsUrl;
	}

	private _habboAvatarActionsHash: string = '';

	get habboAvatarActionsHash(): string
	{
		return this._habboAvatarActionsHash;
	}

	private _productDataUrl: string = '';

	get productDataUrl(): string
	{
		return this._productDataUrl;
	}

	private _productDataHash: string = '';

	get productDataHash(): string
	{
		return this._productDataHash;
	}

	/**
	 * Parse game data resources from JSON string
	 */
	static parse(data: string): GameDataResources
	{
		let parsed: HashesData;
		try
		{
			parsed = JSON.parse(data) as HashesData;
		} catch
		{
			throw new Error('[GameDataResources] Failed to parse game data JSON');
		}
		const resources = new GameDataResources();

		for (const entry of parsed.hashes)
		{
			switch (entry.name)
			{
				case 'effect_map':
					resources._effectMapUrl = entry.url;
					resources._effectMapHash = entry.hash;
					break;
				case 'external_renderer_variables':
					resources._externalRendererVariablesUrl = entry.url;
					resources._externalRendererVariablesHash = entry.hash;
					break;
				case 'external_texts':
					resources._externalTextsUrl = entry.url;
					resources._externalTextsHash = entry.hash;
					break;
				case 'external_ui_variables':
					resources._externalUIVariablesUrl = entry.url;
					resources._externalUIVariablesHash = entry.hash;
					break;
				case 'figure_data':
					resources._figureDataUrl = entry.url;
					resources._figureDataHash = entry.hash;
					break;
				case 'figure_map':
					resources._figureMapUrl = entry.url;
					resources._figureMapHash = entry.hash;
					break;
				case 'furniture_data':
					resources._furnitureDataUrl = entry.url;
					resources._furnitureDataHash = entry.hash;
					break;
				case 'habbo_avatar_actions':
					resources._habboAvatarActionsUrl = entry.url;
					resources._habboAvatarActionsHash = entry.hash;
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
			this._effectMapUrl &&
			this._effectMapHash &&
			this._externalRendererVariablesUrl &&
			this._externalRendererVariablesHash &&
			this._externalTextsUrl &&
			this._externalTextsHash &&
			this._externalUIVariablesUrl &&
			this._externalUIVariablesHash &&
			this._figureDataUrl &&
			this._figureDataHash &&
			this._figureMapUrl &&
			this._figureMapHash &&
			this._furnitureDataUrl &&
			this._furnitureDataHash &&
			this._habboAvatarActionsUrl &&
			this._habboAvatarActionsHash &&
			this._productDataUrl &&
			this._productDataHash
		);
	}
}
