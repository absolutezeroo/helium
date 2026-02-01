import {createRoot, createSignal} from 'solid-js';
import type {
	GuestRoomData,
	RoomEventData,
} from '@habbo/communication/messages/incoming/navigator';
import {
	GetGuestRoomResultMessageEvent,
	RoomEventCancelMessageEvent,
	RoomEventMessageEvent,
	RoomRatingMessageEvent,
} from '@habbo/communication/messages/incoming/navigator';
import type {
	GetGuestRoomResultMessageParser
} from '@habbo/communication/messages/parser/navigator/GetGuestRoomResultMessageParser';
import type {
	RoomRatingMessageParser
} from '@habbo/communication/messages/parser/navigator/RoomRatingMessageParser';
import type {
	RoomEventMessageParser
} from '@habbo/communication/messages/parser/navigator/RoomEventMessageParser';
import {registerMessageEvent} from '../../hooks';

/**
 * Room store - manages current room state
 *
 * This store holds data about the room the user is currently in.
 * Used by navigator, toolbar, chat, room info panel, etc.
 */
function createRoomStore()
{
	// Current room data
	const [currentRoom, setCurrentRoom] = createSignal<GuestRoomData | null>(null);
	const [rating, setRating] = createSignal(0);
	const [canRate, setCanRate] = createSignal(false);
	const [isStaffPick, setIsStaffPick] = createSignal(false);
	const [roomEvent, setRoomEvent] = createSignal<RoomEventData | null>(null);

	// Cleanup functions
	const cleanupFunctions: Array<() => void> = [];

	/**
	 * Initialize message event listeners
	 */
	function init(): void
	{
		// Room info / entry
		cleanupFunctions.push(
			registerMessageEvent(GetGuestRoomResultMessageEvent, (_, parser) =>
			{
				const p = parser as GetGuestRoomResultMessageParser;

				if (p.enterRoom && p.data)
				{
					setCurrentRoom(p.data);
					setIsStaffPick(p.staffPick);
				}
			})
		);

		// Room rating
		cleanupFunctions.push(
			registerMessageEvent(RoomRatingMessageEvent, (_, parser) =>
			{
				const p = parser as RoomRatingMessageParser;

				setRating(p.rating);
				setCanRate(p.canRate);
			})
		);

		// Room event
		cleanupFunctions.push(
			registerMessageEvent(RoomEventMessageEvent, (_, parser) =>
			{
				const p = parser as RoomEventMessageParser;

				setRoomEvent(p.data);
			})
		);

		// Room event cancelled
		cleanupFunctions.push(
			registerMessageEvent(RoomEventCancelMessageEvent, () =>
			{
				setRoomEvent(null);
			})
		);
	}

	/**
	 * Clear current room state (called when exiting room)
	 */
	function clear(): void
	{
		setCurrentRoom(null);
		setRating(0);
		setCanRate(false);
		setIsStaffPick(false);
		setRoomEvent(null);
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
		currentRoom,
		rating,
		canRate,
		isStaffPick,
		roomEvent,

		// Lifecycle
		init,
		clear,
		dispose,
	};
}

export const roomStore = createRoot(createRoomStore);
