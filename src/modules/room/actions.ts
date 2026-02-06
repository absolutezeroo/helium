import type {IActionContext} from '../core/types';
import type {IRoomState, IRoomUserData, RoomUserTypeValue} from './types';
import {createInitialRoomState, RoomUserType} from './types';

// Room module has no managers - it's purely reactive to server messages
type Managers = Record<string, never>;

export function createActions(ctx: IActionContext<IRoomState, Managers>)
{
	const {getState, updateState} = ctx;

	return {
		/**
		 * Clear room state (when leaving room)
		 */
		clear: (): void =>
		{
			updateState(createInitialRoomState());
		},

		/**
		 * Check if user is currently in a room
		 */
		isInRoom: (): boolean =>
		{
			return getState().currentRoom !== null;
		},

		/**
		 * Check if session has started (room is fully loaded)
		 */
		isSessionStarted: (): boolean =>
		{
			return getState().sessionState === 'started';
		},

		/**
		 * Get current room ID
		 */
		roomId: (): number =>
		{
			return getState().currentRoom?.flatId ?? 0;
		},

		/**
		 * Get current room name
		 */
		roomName: (): string =>
		{
			return getState().currentRoom?.roomName ?? '';
		},

		/**
		 * Get all users in the room
		 */
		getUsers: (): IRoomUserData[] =>
		{
			return Object.values(getState().users);
		},

		/**
		 * Get users by type
		 */
		getUsersByType: (type: RoomUserTypeValue): IRoomUserData[] =>
		{
			return Object.values(getState().users).filter(u => u.type === type);
		},

		/**
		 * Get only human users (no pets/bots)
		 */
		getHumanUsers: (): IRoomUserData[] =>
		{
			return Object.values(getState().users).filter(u => u.type === RoomUserType.USER);
		},

		/**
		 * Get user by room index
		 */
		getUserByIndex: (roomIndex: number): IRoomUserData | undefined =>
		{
			return getState().users[roomIndex];
		},

		/**
		 * Get user by web ID
		 */
		getUserById: (webId: number): IRoomUserData | undefined =>
		{
			return Object.values(getState().users).find(u => u.webId === webId);
		},

		/**
		 * Get user by name
		 */
		getUserByName: (name: string): IRoomUserData | undefined =>
		{
			return Object.values(getState().users).find(
				u => u.name.toLowerCase() === name.toLowerCase()
			);
		},

		/**
		 * Get own user in room
		 */
		getOwnUser: (): IRoomUserData | undefined =>
		{
			const ownIndex = getState().ownUserRoomIndex;

			if (ownIndex < 0)
			{
				return undefined;
			}

			return getState().users[ownIndex];
		},

		/**
		 * Get user count
		 */
		getUserCount: (): number =>
		{
			return Object.keys(getState().users).length;
		},

		/**
		 * Check if user is room owner
		 */
		isOwner: (): boolean =>
		{
			return getState().isRoomOwner;
		},

		/**
		 * Check if user has rights (controller level > 0)
		 */
		hasRights: (): boolean =>
		{
			return getState().roomControllerLevel > 0;
		},

		/**
		 * Get controller level
		 */
		getControllerLevel: (): number =>
		{
			return getState().roomControllerLevel;
		},

		/**
		 * Set own user room index (called by RoomEngine)
		 */
		setOwnUserIndex: (roomIndex: number): void =>
		{
			updateState({ownUserRoomIndex: roomIndex});
		},
	};
}

export type RoomActions = ReturnType<typeof createActions>;
