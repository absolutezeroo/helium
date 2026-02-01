import {createRoot, createSignal} from 'solid-js';
import {registerMessageEvent} from '@/ui/hooks';
import type {GuestRoomData, RoomEventData} from '@habbo/communication/messages/incoming/navigator';
import {
	GetGuestRoomResultMessageEvent,
	RoomEventCancelMessageEvent,
	RoomEventMessageEvent,
	RoomRatingMessageEvent,
} from '@habbo/communication/messages/incoming/navigator';
import type {GetGuestRoomResultMessageParser} from '@habbo/communication/messages/parser/navigator/GetGuestRoomResultMessageParser';
import type {RoomRatingMessageParser} from '@habbo/communication/messages/parser/navigator/RoomRatingMessageParser';
import type {RoomEventMessageParser} from '@habbo/communication/messages/parser/navigator/RoomEventMessageParser';

/**
 * Room Feature
 *
 * Tracks the current room the user is in, including room data,
 * rating, staff pick status, and active events.
 *
 * @example
 * ```typescript
 * import { room } from '@/features';
 *
 * // Check if user is in a room
 * if (room.isInRoom()) {
 *   console.log(`In room: ${room.roomName()}`);
 *   console.log(`Rating: ${room.rating()}`);
 * }
 *
 * // Get current room data
 * const roomData = room.currentRoom();
 * ```
 */
function createRoomFeature()
{
	// ========== State ==========
	const [currentRoom, setCurrentRoom] = createSignal<GuestRoomData | null>(null);
	const [rating, setRating] = createSignal(0);
	const [canRate, setCanRate] = createSignal(false);
	const [isStaffPick, setIsStaffPick] = createSignal(false);
	const [roomEvent, setRoomEvent] = createSignal<RoomEventData | null>(null);

	// ========== Cleanup ==========
	const cleanups: (() => void)[] = [];

	// ========== Lifecycle ==========

	function init(): void
	{
		// Room info / entry
		cleanups.push(
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
		cleanups.push(
			registerMessageEvent(RoomRatingMessageEvent, (_, parser) =>
			{
				const p = parser as RoomRatingMessageParser;

				setRating(p.rating);
				setCanRate(p.canRate);
			})
		);

		// Room event
		cleanups.push(
			registerMessageEvent(RoomEventMessageEvent, (_, parser) =>
			{
				const p = parser as RoomEventMessageParser;

				setRoomEvent(p.data);
			})
		);

		// Room event cancelled
		cleanups.push(
			registerMessageEvent(RoomEventCancelMessageEvent, () =>
			{
				setRoomEvent(null);
			})
		);
	}

	function dispose(): void
	{
		cleanups.forEach(fn => fn());
		cleanups.length = 0;
	}

	function clear(): void
	{
		setCurrentRoom(null);
		setRating(0);
		setCanRate(false);
		setIsStaffPick(false);
		setRoomEvent(null);
	}

	// ========== Public API ==========
	return {
		// State (reactive)
		currentRoom,
		rating,
		canRate,
		isStaffPick,
		roomEvent,

		// Computed helpers
		isInRoom: () => currentRoom() !== null,
		roomId: () => currentRoom()?.flatId ?? 0,
		roomName: () => currentRoom()?.roomName ?? '',

		// Lifecycle
		init,
		dispose,
		clear,
	};
}

// ========== Singleton Export ==========
export const room = createRoot(createRoomFeature);
export type Room = typeof room;
