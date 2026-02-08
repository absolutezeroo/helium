import type {ActionContext} from '../core/types';
import type {RoomState, RoomUserData, RoomUserTypeValue} from './types';
import {createInitialRoomState, RoomUserType} from './types';
import type {IRoomSessionManager} from '@habbo/session/IRoomSessionManager';

/**
 * Room module manager dependencies
 */
export interface RoomManagers
{
	roomSessionManager: IRoomSessionManager;
}

export function createActions(ctx: ActionContext<RoomState, RoomManagers>)
{
	const {getState, updateState, managers} = ctx;

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
		getUsers: (): RoomUserData[] =>
		{
			return Object.values(getState().users);
		},

		/**
		 * Get users by type
		 */
		getUsersByType: (type: RoomUserTypeValue): RoomUserData[] =>
		{
			return Object.values(getState().users).filter(u => u.type === type);
		},

		/**
		 * Get only human users (no pets/bots)
		 */
		getHumanUsers: (): RoomUserData[] =>
		{
			return Object.values(getState().users).filter(u => u.type === RoomUserType.USER);
		},

		/**
		 * Get user by room index
		 */
		getUserByIndex: (roomIndex: number): RoomUserData | undefined =>
		{
			return getState().users[roomIndex];
		},

		/**
		 * Get user by web ID
		 */
		getUserById: (webId: number): RoomUserData | undefined =>
		{
			return Object.values(getState().users).find(u => u.webId === webId);
		},

		/**
		 * Get user by name
		 */
		getUserByName: (name: string): RoomUserData | undefined =>
		{
			return Object.values(getState().users).find(
				u => u.name.toLowerCase() === name.toLowerCase()
			);
		},

		/**
		 * Get own user in room
		 */
		getOwnUser: (): RoomUserData | undefined =>
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

		/**
		 * Go to desktop / hotel view (leave current room)
		 *
		 * Based on AS3: HabboLandingView.onToolbarClick() → HTIE_ICON_RECEPTION
		 * Sends QuitMessageComposer, disposes the session, and clears room state.
		 *
		 * @see source_as_win63/habbo/friendbar/landingview/HabboLandingView.as line 328
		 */
		goToDesktop: (): void =>
		{
			const state = getState();
			const roomId = state.currentRoom?.flatId;

			if (roomId == null)
			{
				return;
			}

			const session = managers.roomSessionManager.getSession(roomId);

			if (session)
			{
				session.quit();
				managers.roomSessionManager.disposeSession(roomId);
			}

			updateState(createInitialRoomState());
		},
	};
}

export type RoomActions = ReturnType<typeof createActions>;
