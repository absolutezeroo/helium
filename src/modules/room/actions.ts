import type {ActionContext} from '../core/types';
import type {RoomState} from './types';

// Room module has no managers - it's purely reactive to server messages
type Managers = Record<string, never>;

export function createActions(ctx: ActionContext<RoomState, Managers>)
{
	const {getState, updateState} = ctx;

	return {
		/**
		 * Clear room state (when leaving room)
		 */
		clear: (): void =>
		{
			updateState({
				currentRoom: null,
				rating: 0,
				canRate: false,
				isStaffPick: false,
				roomEvent: null,
			});
		},

		// Computed helpers

		/**
		 * Check if user is currently in a room
		 */
		isInRoom: (): boolean =>
		{
			return getState().currentRoom !== null;
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
	};
}

export type RoomActions = ReturnType<typeof createActions>;
