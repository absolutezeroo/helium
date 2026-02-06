import {defineModule} from '../core/defineModule';
import type {IFavouritesState} from './types';
import type {FavouritesActions} from './actions';
import {createActions} from './actions';
import {handlers} from './handlers';

/**
 * Favourites Module
 *
 * Manages the user's favourite rooms list.
 * Listens to server messages to keep the list in sync.
 *
 * @example
 * ```typescript
 * const { state, actions } = useModule(ModuleId.Favourites);
 *
 * // Check if a room is favourited
 * if (actions.isRoomFavourite(123)) {
 *   console.log('This room is a favourite');
 * }
 *
 * // Check limit
 * console.log(`${actions.count()} / ${state.limit} favourites`);
 * ```
 */
export const favouritesModule = defineModule({
	id: 'favourites',

	depends: [],

	managerIIDs: {},

	initialState: {
		limit: 0,
		roomIds: [],
	} satisfies IFavouritesState,

	handlers,
	actions: createActions,
});

export type {IFavouritesState} from './types';
export type {FavouritesActions} from './actions';

// Declaration merging for type-safe module access
declare module '../core/moduleIds'
{
	interface IModuleStateMap
	{
		'favourites': IFavouritesState;
	}

	interface IModuleActionsMap
	{
		'favourites': FavouritesActions;
	}
}
