import {defineModule} from '../core/defineModule';
import type {LocalizationState} from './types';
import type {LocalizationActions, LocalizationManagers} from './actions';
import {createActions} from './actions';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';

/**
 * Localization Module
 *
 * Provides access to translated strings from external_texts.txt.
 * Supports parameter substitution and special badge/achievement lookups.
 *
 * @example
 * ```typescript
 * const { state, actions } = useModule(ModuleId.Localization);
 *
 * // Simple text lookup
 * const title = actions.get('navigator.title', 'Navigator');
 *
 * // With parameter substitution
 * const welcome = actions.getWithParams('welcome.user', { name: 'John' });
 *
 * // Badge names
 * const badgeName = actions.getBadgeName('ADM');
 * ```
 */
export const localizationModule = defineModule({
	id: 'localization',

	depends: [],

	managerIIDs: {
		localization: IID_HabboLocalizationManager,
	} satisfies Record<keyof LocalizationManagers, unknown>,

	initialState: {
		isLoaded: false as boolean,
		languageCode: '',
	} satisfies LocalizationState,

	handlers: {},

	actions: createActions,

	onInit: ({managers, updateState}) =>
	{
		// Check if already loaded
		const definition = managers.localization.getActiveLocalizationDefinition();

		if (definition)
		{
			updateState({
				languageCode: definition.languageCode,
				isLoaded: true,
			});
		}

		// Listen for localization events
		managers.localization.events.on('loaded', () =>
		{
			const activeDef = managers.localization.getActiveLocalizationDefinition();

			updateState({
				isLoaded: true,
				languageCode: activeDef?.languageCode ?? '',
			});
		});

		managers.localization.events.on('failed', () =>
		{
			updateState({isLoaded: false});
		});
	},
});

export type {LocalizationState} from './types';
export type {LocalizationActions, LocalizationManagers} from './actions';

// Declaration merging for type-safe module access
declare module '../core/moduleIds'
{
	interface ModuleStateMap
	{
		'localization': LocalizationState;
	}

	interface ModuleActionsMap
	{
		'localization': LocalizationActions;
	}
}
