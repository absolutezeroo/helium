import {defineModule} from '../core/defineModule';
import type {ConfigState} from './types';
import type {ConfigManagers, ConfigActions} from './actions';
import {createActions} from './actions';
import {IID_HabboConfigurationManager} from '@iid/IIDHabboConfigurationManager';

/**
 * Config Module
 *
 * Provides access to the Habbo configuration (external_variables.txt).
 *
 * @example
 * ```typescript
 * const { state, actions } = useModule(ModuleId.Config);
 *
 * // Get string value
 * const assetUrl = actions.get('flash.client.url');
 *
 * // Get typed values
 * const maxFurni = actions.getInteger('room.furniture.limit', 100);
 * const isEnabled = actions.getBoolean('feature.enabled');
 * ```
 */
export const configModule = defineModule({
	id: 'config',

	depends: [],

	managerIIDs: {
		configuration: IID_HabboConfigurationManager,
	} satisfies Record<keyof ConfigManagers, unknown>,

	initialState: {
		isLoaded: false as boolean,
	} satisfies ConfigState,

	handlers: {},

	actions: createActions,

	onInit: ({managers, updateState}) =>
	{
		// Check if already loaded
		if (managers.configuration.isInitialized())
		{
			updateState({isLoaded: true});
		}

		// Listen for configuration load
		managers.configuration.events.on('complete', () =>
		{
			updateState({isLoaded: true});
		});
	},
});

export type {ConfigState} from './types';
export type {ConfigActions, ConfigManagers} from './actions';

// Declaration merging for type-safe module access
declare module '../core/moduleIds' {
	interface ModuleStateMap {
		'config': ConfigState;
	}
	interface ModuleActionsMap {
		'config': ConfigActions;
	}
}
