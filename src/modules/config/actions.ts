import type {ActionContext} from '../core/types';
import type {ConfigState} from './types';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';

/**
 * Config manager dependencies
 */
export interface ConfigManagers
{
	configuration: IHabboConfigurationManager;
}

export function createActions(ctx: ActionContext<ConfigState, ConfigManagers>)
{
	const {updateState, managers} = ctx;

	return {
		/**
		 * Get a configuration value as string
		 */
		get: (key: string, defaultValue: string = ''): string =>
		{
			const value = managers.configuration.getProperty(key);

			return value || defaultValue;
		},

		/**
		 * Get a configuration value as boolean
		 */
		getBoolean: (key: string): boolean =>
		{
			return managers.configuration.getBoolean(key);
		},

		/**
		 * Get a configuration value as integer
		 */
		getInteger: (key: string, defaultValue: number = 0): number =>
		{
			return managers.configuration.getInteger(key, defaultValue);
		},

		/**
		 * Check if a configuration key exists
		 */
		exists: (key: string): boolean =>
		{
			return managers.configuration.propertyExists(key);
		},

		/**
		 * Mark configuration as loaded
		 */
		setLoaded: (): void =>
		{
			updateState({isLoaded: true});
		},
	};
}

export type ConfigActions = ReturnType<typeof createActions>;
