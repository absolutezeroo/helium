import {createRoot, createSignal} from 'solid-js';
import {registerMessageEvent} from '@/ui/hooks';
import {
	FavouriteChangedMessageEvent,
	FavouritesMessageEvent,
} from '@habbo/communication/messages/incoming/navigator';
import type {FavouritesMessageParser} from '@habbo/communication/messages/parser/navigator/FavouritesMessageParser';
import type {FavouriteChangedMessageParser} from '@habbo/communication/messages/parser/navigator/FavouriteChangedMessageParser';

/**
 * Favourites Feature
 *
 * Manages the user's favourite rooms list. Listens to server messages
 * to keep the list in sync.
 *
 * @example
 * ```typescript
 * import { favourites } from '@/features';
 *
 * // Check if a room is favourited
 * if (favourites.isRoomFavourite(123)) {
 *   console.log('This room is a favourite');
 * }
 *
 * // Check limit
 * if (favourites.isFull()) {
 *   console.log('Cannot add more favourites');
 * }
 *
 * // Get count
 * console.log(`${favourites.count()} / ${favourites.limit()} favourites`);
 * ```
 */
function createFavouritesFeature()
{
	// ========== State ==========
	const [limit, setLimit] = createSignal(0);
	const [roomIds, setRoomIds] = createSignal<Set<number>>(new Set());

	// ========== Cleanup ==========
	const cleanups: (() => void)[] = [];

	// ========== Lifecycle ==========

	function init(): void
	{
		// Favourites list received
		cleanups.push(
			registerMessageEvent(FavouritesMessageEvent, (_, parser) =>
			{
				const p = parser as FavouritesMessageParser;

				setLimit(p.limit);
				setRoomIds(new Set(p.favouriteRoomIds));
			})
		);

		// Single favourite added/removed
		cleanups.push(
			registerMessageEvent(FavouriteChangedMessageEvent, (_, parser) =>
			{
				const p = parser as FavouriteChangedMessageParser;

				setRoomIds((prev) =>
				{
					const next = new Set(prev);

					if (p.added)
					{
						next.add(p.flatId);
					}
					else
					{
						next.delete(p.flatId);
					}

					return next;
				});
			})
		);
	}

	function dispose(): void
	{
		cleanups.forEach(fn => fn());
		cleanups.length = 0;
	}

	// ========== Helpers ==========

	function isRoomFavourite(roomId: number): boolean
	{
		return roomIds().has(roomId);
	}

	function isFull(): boolean
	{
		return roomIds().size >= limit();
	}

	function count(): number
	{
		return roomIds().size;
	}

	// ========== Public API ==========
	return {
		// State (reactive)
		limit,
		roomIds,

		// Helpers
		isRoomFavourite,
		isFull,
		count,

		// Lifecycle
		init,
		dispose,
	};
}

// ========== Singleton Export ==========
export const favourites = createRoot(createFavouritesFeature);
export type Favourites = typeof favourites;
