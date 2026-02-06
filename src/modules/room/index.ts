import {defineModule} from '../core/defineModule';
import type {IRoomState} from './types';
import {createInitialRoomState} from './types';
import type {RoomActions} from './actions';
import {createActions} from './actions';
import {handlers} from './handlers';

/**
 * Room Module
 *
 * Tracks the current room the user is in, including:
 * - Room data (name, owner, rating, etc.)
 * - Session state (created, started, ended)
 * - Users in the room (users, pets, bots)
 * - Permissions (owner, controller level)
 *
 * @example
 * ```typescript
 * const { state, actions } = useModule(ModuleId.Room);
 *
 * // Check if user is in a room
 * if (actions.isInRoom()) {
 *   console.log(`In room: ${actions.roomName()}`);
 *   console.log(`Users: ${actions.getUserCount()}`);
 *   console.log(`Is owner: ${actions.isOwner()}`);
 * }
 *
 * // Get all human users
 * const users = actions.getHumanUsers();
 * ```
 */
export const roomModule = defineModule({
	id: 'room',

	depends: [],

	managerIIDs: {},

	initialState: createInitialRoomState(),

	handlers,
	actions: createActions,
});

export type {IRoomState, IRoomUserData, RoomSessionState, RoomUserTypeValue} from './types';
export {RoomUserType} from './types';
export type {RoomActions} from './actions';

// Declaration merging for type-safe module access
declare module '../core/moduleIds'
{
	interface IModuleStateMap
	{
		'room': IRoomState;
	}

	interface IModuleActionsMap
	{
		'room': RoomActions;
	}
}
