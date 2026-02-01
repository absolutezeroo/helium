import {createRoot, createSignal} from 'solid-js';
import type {ConfigManagers} from './types';

/**
 * Config Feature
 *
 * Provides access to the Habbo configuration (external_variables.txt).
 * Wraps the ConfigurationManager with a reactive layer.
 *
 * @example
 * ```typescript
 * import { config } from '@/features';
 *
 * // Get string value
 * const assetUrl = config.get('flash.client.url');
 *
 * // Get typed values
 * const maxFurni = config.getInteger('room.furniture.limit', 100);
 * const isEnabled = config.getBoolean('feature.enabled');
 *
 * // Check existence
 * if (config.exists('custom.setting')) {
 *   // ...
 * }
 * ```
 */
function createConfigFeature()
{
	// ========== State ==========
	const [isLoaded, setIsLoaded] = createSignal(false);

	// ========== Manager Reference ==========
	let managers: ConfigManagers = {configuration: null};

	// ========== Lifecycle ==========

	function init(mgrs: ConfigManagers): void
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

	function dispose(): void
	{
		managers = {configuration: null};
		setIsLoaded(false);
	}

	// ========== Accessors ==========

	/**
	 * Get a configuration value as string
	 */
	function get(key: string, defaultValue: string = ''): string
	{
		if (!managers.configuration) return defaultValue;

		const value = managers.configuration.getProperty(key);

		return value || defaultValue;
	}

	/**
	 * Get a configuration value as boolean
	 */
	function getBoolean(key: string): boolean
	{
		if (!managers.configuration) return false;

		return managers.configuration.getBoolean(key);
	}

	/**
	 * Get a configuration value as integer
	 */
	function getInteger(key: string, defaultValue: number = 0): number
	{
		if (!managers.configuration) return defaultValue;

		return managers.configuration.getInteger(key, defaultValue);
	}

	/**
	 * Check if a configuration key exists
	 */
	function exists(key: string): boolean
	{
		if (!managers.configuration) return false;

		return managers.configuration.propertyExists(key);
	}

	// ========== Public API ==========
	return {
		// State (reactive)
		isLoaded,

		// Accessors
		get,
		getBoolean,
		getInteger,
		exists,

		// Lifecycle
		init,
		dispose,
	};
}

// ========== Singleton Export ==========
export const config = createRoot(createConfigFeature);
export type Config = typeof config;
