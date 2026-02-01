import {createRoot, createSignal} from 'solid-js';
import type {IHabboNavigator, IHabboNewNavigator} from '@habbo/navigator';
import type {
	EventCategory,
	FlatCategory,
	GuestRoomSearchResultData,
	PopularTagsData,
} from '@habbo/communication/messages/incoming/navigator';
import {
	GuestRoomSearchResultMessageEvent,
	NavigatorSettingsMessageEvent,
	PopularRoomTagsResultMessageEvent,
	UserEventCatsMessageEvent,
	UserFlatCatsMessageEvent,
} from '@habbo/communication/messages/incoming/navigator';
import type {
	NavigatorSearchResultSet,
	NavigatorTopLevelContext,
} from '@habbo/communication/messages/incoming/newnavigator';
import {
	NavigatorMetaDataMessageEvent,
	NavigatorSearchResultSetMessageEvent,
} from '@habbo/communication/messages/incoming/newnavigator';

// Parsers
import type {
	NavigatorSettingsMessageParser
} from '@habbo/communication/messages/parser/navigator/NavigatorSettingsMessageParser';
import type {
	UserFlatCatsMessageParser
} from '@habbo/communication/messages/parser/navigator/UserFlatCatsMessageParser';
import type {
	UserEventCatsMessageParser
} from '@habbo/communication/messages/parser/navigator/UserEventCatsMessageParser';
import type {
	GuestRoomSearchResultMessageParser
} from '@habbo/communication/messages/parser/navigator/GuestRoomSearchResultMessageParser';
import type {
	PopularRoomTagsResultMessageParser
} from '@habbo/communication/messages/parser/navigator/PopularRoomTagsResultMessageParser';
import type {
	NavigatorMetaDataMessageParser
} from '@habbo/communication/messages/parser/newnavigator/NavigatorMetaDataMessageParser';
import type {
	NavigatorSearchResultSetMessageParser
} from '@habbo/communication/messages/parser/newnavigator/NavigatorSearchResultSetMessageParser';

import {registerMessageEvent} from '../../hooks';

/**
 * Navigator store - manages navigator UI and search state
 */
function createNavigatorStore()
{
	// UI state
	const [isOpen, setIsOpen] = createSignal(false);
	const [isRoomInfoOpen, setIsRoomInfoOpen] = createSignal(false);
	const [isCreateModalOpen, setIsCreateModalOpen] = createSignal(false);

	// Search state
	const [currentSearchCode, setCurrentSearchCode] = createSignal<string>('');
	const [topLevelContexts, setTopLevelContexts] = createSignal<NavigatorTopLevelContext[]>([]);
	const [navigatorSearchResults, setNavigatorSearchResults] = createSignal<NavigatorSearchResultSet | null>(null);
	const [legacySearchResults, setLegacySearchResults] = createSignal<GuestRoomSearchResultData | null>(null);
	const [popularTags, setPopularTags] = createSignal<PopularTagsData | null>(null);

	// Categories
	const [flatCategories, setFlatCategories] = createSignal<FlatCategory[]>([]);
	const [eventCategories, setEventCategories] = createSignal<EventCategory[]>([]);

	// Settings
	const [homeRoomId, setHomeRoomId] = createSignal(0);

	// Navigator references
	let navigator: IHabboNavigator | null = null;
	let newNavigator: IHabboNewNavigator | null = null;

	// Cleanup functions
	const cleanupFunctions: Array<() => void> = [];

	/**
	 * Connect to navigators and setup message listeners
	 */
	function connect(nav: IHabboNavigator, newNav?: IHabboNewNavigator): void
	{
		navigator = nav;
		newNavigator = newNav ?? null;

		// Navigator settings (home room)
		cleanupFunctions.push(
			registerMessageEvent(NavigatorSettingsMessageEvent, (_, parser) =>
			{
				const p = parser as NavigatorSettingsMessageParser;

				setHomeRoomId(p.homeRoomId);
			})
		);

		// Top level contexts (tabs)
		cleanupFunctions.push(
			registerMessageEvent(NavigatorMetaDataMessageEvent, (_, parser) =>
			{
				const p = parser as NavigatorMetaDataMessageParser;

				setTopLevelContexts([...p.topLevelContexts]);

				// Auto-select first tab if none selected
				if (p.topLevelContexts.length > 0 && !currentSearchCode())
				{
					const firstSearchCode = p.topLevelContexts[0].searchCode;

					setCurrentSearchCode(firstSearchCode);
					newNavigator?.performSearch(firstSearchCode);
				}
			})
		);

		// Flat categories
		cleanupFunctions.push(
			registerMessageEvent(UserFlatCatsMessageEvent, (_, parser) =>
			{
				const p = parser as UserFlatCatsMessageParser;

				setFlatCategories(p.nodes.filter((cat) => cat.visible));
			})
		);

		// Event categories
		cleanupFunctions.push(
			registerMessageEvent(UserEventCatsMessageEvent, (_, parser) =>
			{
				const p = parser as UserEventCatsMessageParser;

				setEventCategories(p.eventCategories.filter((cat) => cat.visible));
			})
		);

		// New navigator search results
		cleanupFunctions.push(
			registerMessageEvent(NavigatorSearchResultSetMessageEvent, (_, parser) =>
			{
				const p = parser as NavigatorSearchResultSetMessageParser;

				setNavigatorSearchResults(p.searchResult);
			})
		);

		// Legacy guest room search results
		cleanupFunctions.push(
			registerMessageEvent(GuestRoomSearchResultMessageEvent, (_, parser) =>
			{
				const p = parser as GuestRoomSearchResultMessageParser;

				setLegacySearchResults(p.data);
			})
		);

		// Popular tags
		cleanupFunctions.push(
			registerMessageEvent(PopularRoomTagsResultMessageEvent, (_, parser) =>
			{
				const p = parser as PopularRoomTagsResultMessageParser;

				setPopularTags(p.data);
			})
		);
	}

	/**
	 * Disconnect and cleanup
	 */
	function disconnect(): void
	{
		for (const cleanup of cleanupFunctions)
		{
			cleanup();
		}

		cleanupFunctions.length = 0;
		navigator = null;
		newNavigator = null;
	}

	// ========== UI Actions ==========

	function openNavigator(): void
	{
		setIsOpen(true);
		newNavigator?.open();
	}

	function closeNavigator(): void
	{
		setIsOpen(false);
		newNavigator?.close();
	}

	function toggleNavigator(): void
	{
		if (isOpen())
		{
			closeNavigator();
		}
		else
		{
			openNavigator();
		}
	}

	function openRoomInfo(): void
	{
		setIsRoomInfoOpen(true);
	}

	function closeRoomInfo(): void
	{
		setIsRoomInfoOpen(false);
	}

	function toggleRoomInfo(): void
	{
		setIsRoomInfoOpen((prev) => !prev);
	}

	function openCreateModal(): void
	{
		setIsCreateModalOpen(true);
		navigator?.startRoomCreation();
	}

	function closeCreateModal(): void
	{
		setIsCreateModalOpen(false);
	}

	// ========== Navigation Actions ==========

	function goToHomeRoom(): boolean
	{
		return navigator?.goToHomeRoom() ?? false;
	}

	function goToPrivateRoom(roomId: number): void
	{
		navigator?.goToPrivateRoom(roomId);
	}

	function isRoomHome(roomId: number): boolean
	{
		return roomId === homeRoomId();
	}

	// ========== Search Actions ==========

	function performSearch(searchCode: string, filtering: string = ''): void
	{
		setCurrentSearchCode(searchCode);
		newNavigator?.performSearch(searchCode, filtering);
	}

	function searchRooms(query: string): void
	{
		navigator?.performTextSearch(query);
	}

	function searchByTag(tag: string): void
	{
		navigator?.performTagSearch(tag);
	}

	function showOwnRooms(): void
	{
		navigator?.showOwnRooms();
	}

	return {
		// UI State
		isOpen,
		isRoomInfoOpen,
		isCreateModalOpen,

		// Search State
		currentSearchCode,
		topLevelContexts,
		navigatorSearchResults,
		legacySearchResults,
		popularTags,

		// Categories
		flatCategories,
		eventCategories,

		// Settings
		homeRoomId,

		// Connection
		connect,
		disconnect,

		// UI Actions
		openNavigator,
		closeNavigator,
		toggleNavigator,
		openRoomInfo,
		closeRoomInfo,
		toggleRoomInfo,
		openCreateModal,
		closeCreateModal,

		// Navigation Actions
		goToHomeRoom,
		goToPrivateRoom,
		isRoomHome,

		// Search Actions
		performSearch,
		searchRooms,
		searchByTag,
		showOwnRooms,
	};
}

export const navigatorStore = createRoot(createNavigatorStore);
