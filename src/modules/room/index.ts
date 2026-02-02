import {defineModule} from '../core/defineModule';
import type {RoomState} from './types';
import type {RoomActions} from './actions';
import {handlers} from './handlers';
import {createActions} from './actions';

/**
 * Room Module
 *
 * Tracks the current room the user is in, including room data,
 * rating, staff pick status, and active events.
 *
 * @example
 * ```typescript
 * const { state, actions } = useModule(ModuleId.Room);
 *
 * // Check if user is in a room
 * if (actions.isInRoom()) {
 *   console.log(`In room: ${actions.roomName()}`);
 *   console.log(`Rating: ${state.rating}`);
 * }
 * ```
 */
export const roomModule = defineModule({
	id: 'room',

	depends: [],

	managerIIDs: {},

	initialState: {
		currentRoom: null,
		rating: 0,
		canRate: false,
		isStaffPick: false,
		roomEvent: null,
	} satisfies RoomState,

	handlers,
	actions: createActions,
});

export type {RoomState} from './types';
export type {RoomActions} from './actions';

// Declaration merging for type-safe module access
declare module '../core/moduleIds' {
	interface ModuleStateMap {
		'room': RoomState;
	}
	interface ModuleActionsMap {
		'room': RoomActions;
	}
}
