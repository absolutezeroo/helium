import {defineModule} from '../core/defineModule';
import type {SessionState} from './types';
import {handlers} from './handlers';
import {createActions, SessionActions} from './actions';

/**
 * Session Module
 *
 * Manages the current user's session data including profile info,
 * permissions, currencies, home room, and availability status.
 *
 * This module has no manager dependencies - it purely reacts to
 * server messages to build up the session state.
 *
 * @example
 * ```typescript
 * // In UI component
 * const { state, actions } = useModule(ModuleId.Session);
 *
 * // Read user data
 * const userName = state.userData?.name;
 *
 * // Check permissions
 * if (actions.hasClub()) {
 *   console.log('User has club membership');
 * }
 * ```
 */
export const sessionModule = defineModule({
	id: 'session',

	// No module dependencies
	depends: [],

	// No manager dependencies - session is purely reactive
	managerIIDs: {},

	initialState: {
		userData: null,
		availability: null,
		clubLevel: 0,
		securityLevel: 0,
		achievementScore: 0,
		isAmbassador: false,
		isFirstLoginOfDay: false,
		activityPoints: new Map(),
		homeRoomId: 0,
		roomIdToEnter: 0,
		favouriteRooms: [],
	} satisfies SessionState,

	handlers,
	actions: createActions,
});

export type {SessionState, UserData, AvailabilityStatus} from './types';
export type {SessionActions} from './actions';

// Declaration merging for type-safe module access
declare module '../core/moduleIds'
{
	interface ModuleStateMap
	{
		'session': SessionState;
	}

	interface ModuleActionsMap
	{
		'session': SessionActions;
	}
}
