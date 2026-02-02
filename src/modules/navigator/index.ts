import {defineModule} from '../core/defineModule';
import type {NavigatorState} from './types';
import type {NavigatorActions, NavigatorManagers} from './actions';
import {createActions} from './actions';
import {handlers} from './handlers';
import {IID_HabboNavigator} from '@iid/IIDHabboNavigator';
import {IID_HabboNewNavigator} from '@iid/IIDHabboNewNavigator';

/**
 * Navigator Module
 *
 * Manages the room navigator UI state, search functionality, and room navigation.
 * Combines the legacy HabboNavigator and the newer NewNavigator managers.
 *
 * This module depends on two managers:
 * - IHabboNavigator: Legacy navigator for room operations
 * - IHabboNewNavigator: New navigator for search and UI operations
 *
 * @example
 * ```typescript
 * // In UI component
 * const { state, actions } = useModule(ModuleId.Navigator);
 *
 * // Open navigator
 * actions.open();
 *
 * // Search for rooms
 * actions.search('hotel_view');
 *
 * // Go to a room
 * actions.goToRoom(123);
 * ```
 */
export const navigatorModule = defineModule({
	id: 'navigator',

	// No module dependencies
	depends: [],

	// Manager dependencies resolved via IID
	managerIIDs: {
		navigator: IID_HabboNavigator,
		newNavigator: IID_HabboNewNavigator,
	} satisfies Record<keyof NavigatorManagers, unknown>,

	initialState: {
		// UI State
		isOpen: false,
		isRoomInfoOpen: false,
		isCreateModalOpen: false,

		// Search State
		currentSearchCode: '',
		topLevelContexts: [],
		searchResults: null,
		legacySearchResults: null,
		popularTags: null,

		// Categories
		flatCategories: [],
		eventCategories: [],

		// Settings
		homeRoomId: 0,
	} satisfies NavigatorState,

	handlers,
	actions: createActions,

	// Optional: perform initial search when metadata arrives
	onInit: ({managers, getState}) =>
	{
		// If we have contexts but no search code selected, trigger initial search
		const state = getState();

		if (state.topLevelContexts.length > 0 && state.currentSearchCode)
		{
			managers.newNavigator.performSearch(state.currentSearchCode);
		}
	},
});

export type {NavigatorState} from './types';
export type {NavigatorActions, NavigatorManagers} from './actions';

// Declaration merging for type-safe module access
declare module '../core/moduleIds'
{
	interface ModuleStateMap
	{
		'navigator': NavigatorState;
	}

	interface ModuleActionsMap
	{
		'navigator': NavigatorActions;
	}
}
