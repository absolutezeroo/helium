import {IID_HabboConfigurationManager} from '@iid/IIDHabboConfigurationManager';
import {defineModule} from '../core/defineModule';
import type {IConfigState} from './types';
import type {ConfigActions, IConfigManagers} from './actions';
import {createActions} from './actions';

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
	} satisfies Record<keyof IConfigManagers, unknown>,

	initialState: {
		isLoaded: false as boolean, // cast: type assertion required
	} satisfies IConfigState,

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

export type {IConfigState} from './types';
export type {ConfigActions, IConfigManagers} from './actions';

// Declaration merging for type-safe module access
declare module '../core/moduleIds'
{
	interface IModuleStateMap
	{
		'config': IConfigState;
	}

	interface IModuleActionsMap
	{
		'config': ConfigActions;
	}
}
