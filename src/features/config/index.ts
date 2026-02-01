import {createRoot, createSignal} from 'solid-js';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';

// ============================================================================
// Types
// ============================================================================

export interface ConfigManagers
{
	configuration: IHabboConfigurationManager | null;
}

// ============================================================================
// Feature
// ============================================================================

function createConfigFeature()
{
	// State
	const [isLoaded, setIsLoaded] = createSignal(false);

	// Manager reference
	let managers: ConfigManagers = {configuration: null};

	// Lifecycle
	function init(mgrs: ConfigManagers)
	{
		managers = mgrs;

		if (managers.configuration)
		{
			setIsLoaded(managers.configuration.isInitialized());

			managers.configuration.on('complete', () =>
			{
				setIsLoaded(true);
			});
		}
	}

	function dispose()
	{
		managers = {configuration: null};
		setIsLoaded(false);
	}

	// Accessors
	function get(key: string, defaultValue: string = ''): string
	{
		if (!managers.configuration) return defaultValue;

		const value = managers.configuration.getProperty(key);

		return value || defaultValue;
	}

	function getBoolean(key: string): boolean
	{
		if (!managers.configuration) return false;

		return managers.configuration.getBoolean(key);
	}

	function getInteger(key: string, defaultValue: number = 0): number
	{
		if (!managers.configuration) return defaultValue;

		return managers.configuration.getInteger(key, defaultValue);
	}

	function exists(key: string): boolean
	{
		if (!managers.configuration) return false;

		return managers.configuration.propertyExists(key);
	}

	function getUrl(key: string, defaultValue: string = ''): string
	{
		if (!managers.configuration) return defaultValue;

		return managers.configuration.getURL(key) ?? defaultValue;
	}

	return {
		// State (reactive)
		isLoaded,

		// Accessors (read manager synchronously)
		get,
		getBoolean,
		getInteger,
		getUrl,
		exists,

		// Lifecycle
		init,
		dispose,
	};
}

// Singleton instance
export const config = createRoot(createConfigFeature);
export type Config = typeof config;
