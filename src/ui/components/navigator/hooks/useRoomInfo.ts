import {createMemo} from 'solid-js';
import {navigatorStore} from '@ui/stores';

/**
 * Hook for current room info
 */
export function useRoomInfo()
{
	// Room data
	const room = () => navigatorStore.currentRoom();
	const rating = () => navigatorStore.currentRoomRating();
	const canRate = () => navigatorStore.canRate();
	const isStaffPick = () => navigatorStore.isStaffPick();
	const roomEvent = () => navigatorStore.roomEvent();

	// Derived data
	const hasRoom = createMemo(() => room() !== null);

	const roomId = createMemo(() => room()?.flatId ?? 0);
	const roomName = createMemo(() => room()?.roomName ?? '');
	const ownerName = createMemo(() => room()?.ownerName ?? '');
	const description = createMemo(() => room()?.description ?? '');
	const userCount = createMemo(() => room()?.userCount ?? 0);
	const maxUserCount = createMemo(() => room()?.maxUserCount ?? 0);
	const tags = createMemo(() => room()?.tags ?? []);
	const doorMode = createMemo(() => room()?.doorMode ?? 0);
	const groupId = createMemo(() => room()?.habboGroupId ?? 0);
	const groupName = createMemo(() => room()?.groupName ?? '');
	const groupBadgeCode = createMemo(() => room()?.groupBadgeCode ?? '');

	// Status flags
	const isFull = createMemo(() => userCount() >= maxUserCount());
	const hasGroup = createMemo(() => groupId() > 0);
	const hasTags = createMemo(() => tags().length > 0);
	const hasEvent = createMemo(() => roomEvent() !== null);
	const isLocked = createMemo(() => doorMode() === 1 || doorMode() === 2);
	const isPasswordProtected = createMemo(() => doorMode() === 2);

	// Room event info
	const eventName = createMemo(() => roomEvent()?.eventName ?? '');
	const eventDescription = createMemo(() => roomEvent()?.eventDescription ?? '');

	// Favourite/Home status
	const isFavourite = createMemo(() =>
	{
		const id = roomId();
		return id > 0 ? navigatorStore.isRoomFavourite(id) : false;
	});

	const isHome = createMemo(() =>
	{
		const id = roomId();
		return id > 0 ? navigatorStore.isRoomHome(id) : false;
	});

	// User count display
	const userCountDisplay = createMemo(() =>
	{
		return `${userCount()}/${maxUserCount()}`;
	});

	// Door mode display
	const doorModeDisplay = createMemo(() =>
	{
		switch (doorMode())
		{
			case 0:
				return 'open';
			case 1:
				return 'doorbell';
			case 2:
				return 'password';
			case 3:
				return 'invisible';
			default:
				return 'open';
		}
	});

	return {
		// Raw data
		room,
		rating,
		canRate,
		isStaffPick,
		roomEvent,

		// Derived data
		hasRoom,
		roomId,
		roomName,
		ownerName,
		description,
		userCount,
		maxUserCount,
		tags,
		doorMode,
		groupId,
		groupName,
		groupBadgeCode,

		// Status flags
		isFull,
		hasGroup,
		hasTags,
		hasEvent,
		isLocked,
		isPasswordProtected,
		isFavourite,
		isHome,

		// Event info
		eventName,
		eventDescription,

		// Display helpers
		userCountDisplay,
		doorModeDisplay,
	};
}
