import type {ActionContext} from '../core/types';
import type {FavouritesState} from './types';

// Favourites module has no managers - it's purely reactive to server messages
type Managers = Record<string, never>;

export function createActions(ctx: ActionContext<FavouritesState, Managers>)
{
	const {getState} = ctx;

	return {
		/**
		 * Check if a room is in favourites
		 */
		isRoomFavourite: (roomId: number): boolean =>
		{
			return getState().roomIds.includes(roomId);
		},

		/**
		 * Check if favourites list is full
		 */
		isFull: (): boolean =>
		{
			const state = getState();

			return state.roomIds.length >= state.limit;
		},

		/**
		 * Get current count of favourites
		 */
		count: (): number =>
		{
			return getState().roomIds.length;
		},
	};
}

export type FavouritesActions = ReturnType<typeof createActions>;
