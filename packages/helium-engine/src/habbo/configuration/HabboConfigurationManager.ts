import {Component, type IContext} from '@core/runtime';
import {Logger} from '@core/utils/Logger';
import type {IHabboConfigurationManager} from './IHabboConfigurationManager';

const log = Logger.getLogger('Configuration');

/**
 * Habbo Configuration Manager
 *
 * Based on AS3: com.sulake.habbo.configuration.HabboConfigurationManager
 *
 * Manages application configuration with support for:
 * - Key-value storage with persistent keys
 * - Interpolation (${variable} syntax)
 * - Parameter replacement (%param% syntax)
 * - Environment-specific overrides
 * - External variables download
 * - Gamedata hashes loading
 */
export class HabboConfigurationManager extends Component implements IHabboConfigurationManager
{
	private static readonly INTERPOLATION_DEPTH_LIMIT: number = 3;
	private static readonly REPLACE_CHAR: string = '%';

	private _configurationData: Map<string, string> = new Map();
	private _configurationKeys: string[] = [];
	private _interpolatedCache: Map<string, string> = new Map();
	private _isConfigLoaded: boolean = false;
	private _isConfigReadOnly: boolean = false;

	constructor(context: IContext)
	{
		super(context);

		context.configuration = this;
	}

	private _environmentId: string = '';

	get environmentId(): string
	{
		return this._environmentId;
	}

	private _useHttps: boolean = false;

	get useHttps(): boolean
	{
		return this._useHttps;
	}

	set useHttps(value: boolean)
	{
		this._useHttps = value;
	}

	isInitialized(): boolean
	{
		return this._isConfigLoaded;
	}

	propertyExists(key: string): boolean
	{
		return this._configurationData.has(key);
	}

	getProperty(key: string, params?: Record<string, string>): string
	{
		if (!params)
		{
			const cached = this._interpolatedCache.get(key);

			if (cached !== undefined)
			{
				return cached;
			}
		}

		let value = this._configurationData.get(key) ?? '';

		value = this.interpolate(value);

		if (value === '')
		{
			if (!params) this._interpolatedCache.set(key, '');
			return '';
		}

		// Handle protocol-relative URLs
		if (value.substring(0, 2) === '//')
		{
			value = (this._useHttps ? 'https:' : 'http:') + value;
		}

		value = this.updateUrlProtocol(value);

		if (!params)
		{
			this._interpolatedCache.set(key, value);
		}
		else
		{
			value = this.fillParams(value, params);
		}

		return value;
	}

	setProperty(key: string, value: string, persistent: boolean = false, logIt: boolean = false): void
	{
		if (logIt && !this._configurationData.has(key))
		{
			log.debug(`${key}=${value}`);
		}

		// Don't overwrite persistent keys unless this is also persistent
		if (this._configurationKeys.indexOf(key) < 0 || persistent)
		{
			this._configurationData.set(key, value);
			this._interpolatedCache.clear();
		}

		if (persistent)
		{
			this._configurationKeys.push(key);
		}
	}

	getBoolean(key: string): boolean
	{
		const value = this._configurationData.get(key);
		return value !== undefined && (value === '1' || value.toLowerCase() === 'true');
	}

	getInteger(key: string, defaultValue: number): number
	{
		const value = this._configurationData.get(key);

		if (value === undefined)
		{
			return defaultValue;
		}

		const parsed = parseInt(value, 10);

		return isNaN(parsed) ? defaultValue : parsed;
	}

	interpolate(value: string): string
	{
		if (!value)
		{
			return value;
		}

		const regex = /\$\{([^}]*)\}/g;
		let interpolated = value;
		let limit = HabboConfigurationManager.INTERPOLATION_DEPTH_LIMIT;

		while (limit-- > 0)
		{
			let hasMatch = false;
			let result = '';
			let lastIndex = 0;
			let match: RegExpExecArray | null;

			// Reset regex
			regex.lastIndex = 0;

			while ((match = regex.exec(interpolated)) !== null)
			{
				const key = match[1];

				if (!this.propertyExists(key))
				{
					// Keep original if key doesn't exist
					result += interpolated.substring(lastIndex, match.index + match[0].length);
				}
				else
				{
					result += interpolated.substring(lastIndex, match.index);
					result += this._configurationData.get(key) ?? '';
					hasMatch = true;
				}

				lastIndex = match.index + match[0].length;
			}

			result += interpolated.substring(lastIndex);

			if (!hasMatch)
			{
				break;
			}

			interpolated = result;
		}

		return interpolated;
	}

	updateUrlProtocol(url: string): string
	{
		if (this._useHttps)
		{
			return url.replace('http://', 'https://').replace(':8090/', ':8443/');
		}

		return url;
	}

	updateEnvironmentId(envId: string): void
	{
		if (this._environmentId !== envId)
		{
			this._environmentId = envId;

			this.setProperty('environment.id', envId);
			this.updateEnvironmentVariables();
		}

		this.initEmbeddedConfigurations();
		this.setDefaults();
	}

	resetAll(): void
	{
		this._isConfigLoaded = false;
		this._configurationData.clear();
		this._configurationKeys = [];
		this._interpolatedCache.clear();

		this.parseCommonVariables();
		this.setDefaults();
		this.updateEnvironmentVariables();

		if (!this.propertyExists('environment.id'))
		{
			this.initEmbeddedConfigurations();
		}
	}

	async initConfigurationDownload(): Promise<void>
	{
		this._isConfigLoaded = false;

		const externalVariablesUrl = this.getProperty('external.renderer.variables.json');

		if (!externalVariablesUrl)
		{
			log.warn('No external.renderer.variables.json URL configured');

			this.configurationsComplete();

			return;
		}

		try
		{
			log.info(`Loading configuration from ${externalVariablesUrl}`);

			const response = await fetch(externalVariablesUrl);

			if (!response.ok)
			{
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const configData = await response.text();

			if (configData && configData.length > 0)
			{
				this.parseConfiguration(configData);
			}
			else
			{
				log.error(`Empty configuration data from ${externalVariablesUrl}`);
			}

			this.configurationsLoaded();
		} catch (error)
		{
			const err = error instanceof Error ? error : new Error(String(error));

			log.error(`Configuration download error: ${err.message}`);

			this.events.emit('configurationError', err);
		}
	}

	protected override initComponent(): void
	{
		this.resetAll();
	}

	private updateEnvironmentVariables(): void
	{
		if (!this._environmentId)
		{
			return;
		}

		const keysToUpdate = [
			'connection.info.host',
			'connection.info.port',
			'url.prefix',
			'site.url',
			'flash.dynamic.download.url',
			'flash.dynamic.download.name.template',
			'flash.dynamic.avatar.download.configuration',
			'flash.dynamic.avatar.download.url',
		];

		for (const key of keysToUpdate)
		{
			const defaultValue = this.getProperty(key);
			const envKey = `${key}.${this._environmentId}`;

			if (this.propertyExists(envKey))
			{
				const envValue = this._configurationData.get(envKey) ?? '';

				this.setProperty(key, envValue);
			}
			else
			{
				this.setProperty(key, defaultValue);
			}
		}
	}

	private initEmbeddedConfigurations(): void
	{
		const environment = this._environmentId || localStorage.getItem('habbo_environment') || '';

		if (!environment)
		{
			return;
		}

		log.debug(`Default Environment: ${environment}`);

		// Apply environment-specific overrides
		for (const [key] of this._configurationData)
		{
			const index = key.lastIndexOf(`.${environment}`);

			if (index !== -1 && index + 1 + environment.length === key.length)
			{
				const baseKey = key.substring(0, index);
				const value = this.getProperty(key);

				this.setProperty(baseKey, value);
			}
		}
	}

	private fillParams(template: string, params: Record<string, string>): string
	{
		let result = template;
		const char = HabboConfigurationManager.REPLACE_CHAR;

		for (let i = 0; i < 10; i++)
		{
			const startIndex = result.indexOf(char);

			if (startIndex < 0)
			{
				break;
			}

			const endIndex = result.indexOf(char, startIndex + 1);

			if (endIndex < 0)
			{
				break;
			}

			const paramKey = result.substring(startIndex + 1, endIndex);
			const paramValue = params[paramKey] ?? '';

			result = result.replace(`${char}${paramKey}${char}`, paramValue);
		}

		return result;
	}

	private parseConfiguration(config: string): void
	{
		const trimmed = config.trim();

		// Detect JSON format (starts with { or [)
		if (trimmed.startsWith('{') || trimmed.startsWith('['))
		{
			this.parseJsonConfiguration(trimmed);
			return;
		}

		// Parse key=value text format (original Habbo format)
		this.parseKeyValueConfiguration(config);
	}

	private parseJsonConfiguration(data: string): void
	{
		try
		{
			const json = JSON.parse(data);
			let count = 0;

			for (const [key, value] of Object.entries(json))
			{
				if (value === null || value === undefined)
				{
					continue;
				}

				let stringValue: string;

				if (typeof value === 'string')
				{
					stringValue = value;
				}
				else if (typeof value === 'number' || typeof value === 'boolean')
				{
					stringValue = String(value);
				}
				else
				{
					// Arrays and objects → store as JSON string
					stringValue = JSON.stringify(value);
				}

				this.setProperty(key, stringValue);
				count++;
			}

			log.info(`Parsed ${count} configuration entries from JSON`);
		} catch (error)
		{
			log.error(`Failed to parse JSON configuration: ${error}`);
		}
	}

	private parseKeyValueConfiguration(config: string): void
	{
		const lines = config.split(/\n\r?|\r\n?/);
		let isReadOnly = false;

		for (const line of lines)
		{
			const trimmed = line.trim();

			// Skip comments and empty lines
			if (trimmed.startsWith('#') || trimmed === '')
			{
				continue;
			}

			const parts = trimmed.split('=');

			if (parts.length >= 2 && parts[0].length > 0)
			{
				const key = parts.shift()!.trim();
				const value = parts.join('=').trim();

				if (key === 'configuration.readonly' && value === 'true')
				{
					isReadOnly = true;
				}

				this.setProperty(key, value, isReadOnly);
			}
		}
	}

	private parseCommonVariables(): void
	{
		// Set default common variables
		this.setProperty('client.version', '1.0.0');
		this.setProperty('client.name', 'Helium');
	}

	private setDefaults(): void
	{
		this.setProperty('client.fatal.error.url', '${url.prefix}/flash_client_error');
		this.setProperty('game.center.error.url', '${url.prefix}/log/gameerror');
		this.setProperty('furniture.asset.url', '${asset.url}/bundled/furniture/%className%.nitro');
	}

	private configurationsLoaded(): void
	{
		this.events.emit('configurationLoaded');
		this.configurationsComplete();
	}

	private configurationsComplete(): void
	{
		if (this._isConfigLoaded)
		{
			return;
		}

		this._isConfigLoaded = true;

		log.success('Configuration loaded');

		this.events.emit('complete');
	}
}
