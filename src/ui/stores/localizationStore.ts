import {createStore} from 'solid-js/store';
import {getLocalization} from '@ui/api/helium';

/**
 * Localization Store
 *
 * Provides reactive access to the Habbo localization system.
 * Tracks whether localizations have finished loading and exposes
 * convenience methods for retrieving and updating localized strings.
 */

interface LocalizationStoreState
{
	isLoaded: boolean;
}

const [state, setState] = createStore<LocalizationStoreState>({
	isLoaded: false,
});

const actions = {
	get(key: string, defaultValue?: string): string
	{
		return getLocalization().getLocalization(key, defaultValue);
	},

	getWithParams(key: string, params: Record<string, string>, defaultValue?: string): string
	{
		return getLocalization().getLocalizationWithParamMap(key, defaultValue, new Map(Object.entries(params)));
	},

	has(key: string): boolean
	{
		return getLocalization().hasLocalization(key);
	},

	update(key: string, value: string): void
	{
		getLocalization().updateLocalization(key, value);
	},
};

function init(): void
{
	getLocalization().events.on('loaded', () => setState('isLoaded', true));
}

export const localizationStore = {state, actions, init};
