import {createMemo} from 'solid-js';
import {navigatorStore} from '@ui/stores';

/**
 * Hook for navigator state and actions
 */
export function useNavigator()
{
	// State
	const isOpen = () => navigatorStore.isOpen();
	const isRoomInfoOpen = () => navigatorStore.isRoomInfoOpen();
	const homeRoomId = () => navigatorStore.homeRoomId();
	const flatCategories = () => navigatorStore.flatCategories();
	const eventCategories = () => navigatorStore.eventCategories();

	// Derived state
	const hasCategories = createMemo(() => flatCategories().length > 0);

	// Actions
	const open = () => navigatorStore.openNavigator();
	const close = () => navigatorStore.closeNavigator();
	const toggle = () =>
	{
		if (isOpen())
		{
			close();
		} else
		{
			open();
		}
	};

	const toggleRoomInfo = () => navigatorStore.toggleRoomInfo();
	const goToHomeRoom = () => navigatorStore.goToHomeRoom();
	const goToRoom = (roomId: number) => navigatorStore.goToPrivateRoom(roomId);
	const searchRooms = (query: string) => navigatorStore.searchRooms(query);
	const searchByTag = (tag: string) => navigatorStore.searchByTag(tag);
	const showOwnRooms = () => navigatorStore.showOwnRooms();
	const startRoomCreation = () => navigatorStore.startRoomCreation();

	// Room helpers
	const isRoomFavourite = (roomId: number) => navigatorStore.isRoomFavourite(roomId);
	const isRoomHome = (roomId: number) => navigatorStore.isRoomHome(roomId);

	return {
		// State
		isOpen,
		isRoomInfoOpen,
		homeRoomId,
		flatCategories,
		eventCategories,
		hasCategories,

		// Actions
		open,
		close,
		toggle,
		toggleRoomInfo,
		goToHomeRoom,
		goToRoom,
		searchRooms,
		searchByTag,
		showOwnRooms,
		startRoomCreation,

		// Helpers
		isRoomFavourite,
		isRoomHome,
	};
}
