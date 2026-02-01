import {createRoot, createSignal} from 'solid-js';
import {
	FavouriteChangedMessageEvent,
	FavouritesMessageEvent,
} from '@habbo/communication/messages/incoming/navigator';
import type {
	FavouritesMessageParser
} from '@habbo/communication/messages/parser/navigator/FavouritesMessageParser';
import type {
	FavouriteChangedMessageParser
} from '@habbo/communication/messages/parser/navigator/FavouriteChangedMessageParser';
import {registerMessageEvent} from '../../hooks';

/**
 * Favourites store - manages room favourites
 *
 * Used by navigator results, room info panel, etc.
 */
function createFavouritesStore()
{
	const [limit, setLimit] = createSignal(0);
	const [roomIds, setRoomIds] = createSignal<Set<number>>(new Set());

	// Cleanup functions
	const cleanupFunctions: Array<() => void> = [];

	/**
	 * Initialize message event listeners
	 */
	function init(): void
	{
		// Favourites list received
		cleanupFunctions.push(
			registerMessageEvent(FavouritesMessageEvent, (_, parser) =>
			{
				const p = parser as FavouritesMessageParser;

				setLimit(p.limit);
				setRoomIds(new Set(p.favouriteRoomIds));
			})
		);

		// Single favourite added/removed
		cleanupFunctions.push(
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

	/**
	 * Check if a room is in favourites
	 */
	function isRoomFavourite(roomId: number): boolean
	{
		return roomIds().has(roomId);
	}

	/**
	 * Check if favourites list is full
	 */
	function isFull(): boolean
	{
		return roomIds().size >= limit();
	}

	/**
	 * Get the number of favourites
	 */
	function count(): number
	{
		return roomIds().size;
	}

	/**
	 * Cleanup message event listeners
	 */
	function dispose(): void
	{
		for (const cleanup of cleanupFunctions)
		{
			cleanup();
		}

		cleanupFunctions.length = 0;
	}

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

export const favouritesStore = createRoot(createFavouritesStore);
