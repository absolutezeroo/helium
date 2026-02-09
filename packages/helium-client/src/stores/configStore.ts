import {createStore} from 'solid-js/store';
import {getConfiguration} from '@ui/api/helium';

/**
 * Configuration Store
 *
 * Provides reactive access to the Habbo configuration system.
 * Tracks whether configuration has finished loading and exposes
 * typed accessors (string, boolean, integer) for config properties.
 */

interface ConfigStoreState
{
	isLoaded: boolean;
}

const [state, setState] = createStore<ConfigStoreState>({
	isLoaded: false,
});

const actions = {
	get(key: string): string
	{
		return getConfiguration().getProperty(key);
	},

	getBoolean(key: string): boolean
	{
		return getConfiguration().getBoolean(key);
	},

	getInteger(key: string, defaultValue: number): number
	{
		return getConfiguration().getInteger(key, defaultValue);
	},

	exists(key: string): boolean
	{
		return getConfiguration().propertyExists(key);
	},
};

function init(): void
{
	getConfiguration().events.on('complete', () => setState('isLoaded', true));
}

export const configStore = {state, actions, init};
