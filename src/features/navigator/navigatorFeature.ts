import {createRoot, createSignal} from 'solid-js';
import {registerMessageEvent} from '@/ui/hooks';
import type {NavigatorManagers} from './types';
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
import type {NavigatorSettingsMessageParser} from '@habbo/communication/messages/parser/navigator/NavigatorSettingsMessageParser';
import type {UserFlatCatsMessageParser} from '@habbo/communication/messages/parser/navigator/UserFlatCatsMessageParser';
import type {UserEventCatsMessageParser} from '@habbo/communication/messages/parser/navigator/UserEventCatsMessageParser';
import type {GuestRoomSearchResultMessageParser} from '@habbo/communication/messages/parser/navigator/GuestRoomSearchResultMessageParser';
import type {PopularRoomTagsResultMessageParser} from '@habbo/communication/messages/parser/navigator/PopularRoomTagsResultMessageParser';
import type {NavigatorMetaDataMessageParser} from '@habbo/communication/messages/parser/newnavigator/NavigatorMetaDataMessageParser';
import type {NavigatorSearchResultSetMessageParser} from '@habbo/communication/messages/parser/newnavigator/NavigatorSearchResultSetMessageParser';

/**
 * Navigator Feature
 *
 * Manages the room navigator UI state, search functionality, and room navigation.
 * Combines the legacy HabboNavigator and the newer NewNavigator managers.
 *
 * @example
 * ```typescript
 * import { navigator } from '@/features';
 *
 * // Open/close navigator
 * navigator.open();
 * navigator.toggle();
 *
 * // Search for rooms
 * navigator.search('hotel_view');
 * navigator.searchRooms('my room');
 *
 * // Navigate to a room
 * navigator.goToRoom(123);
 * navigator.goHome();
 * ```
 */
function createNavigatorFeature()
{
	// ========== UI State ==========
	const [isOpen, setIsOpen] = createSignal(false);
	const [isRoomInfoOpen, setIsRoomInfoOpen] = createSignal(false);
	const [isCreateModalOpen, setIsCreateModalOpen] = createSignal(false);

	// ========== Search State ==========
	const [currentSearchCode, setCurrentSearchCode] = createSignal('');
	const [topLevelContexts, setTopLevelContexts] = createSignal<NavigatorTopLevelContext[]>([]);
	const [searchResults, setSearchResults] = createSignal<NavigatorSearchResultSet | null>(null);
	const [legacySearchResults, setLegacySearchResults] = createSignal<GuestRoomSearchResultData | null>(null);
	const [popularTags, setPopularTags] = createSignal<PopularTagsData | null>(null);

	// ========== Categories ==========
	const [flatCategories, setFlatCategories] = createSignal<FlatCategory[]>([]);
	const [eventCategories, setEventCategories] = createSignal<EventCategory[]>([]);

	// ========== Settings ==========
	const [homeRoomId, setHomeRoomId] = createSignal(0);

	// ========== Manager References ==========
	let managers: NavigatorManagers = {navigator: null, newNavigator: null};

	// ========== Cleanup ==========
	const cleanups: (() => void)[] = [];

	// ========== Lifecycle ==========

	function init(mgrs: NavigatorManagers): void
	{
		managers = mgrs;

		// Navigator settings (home room)
		cleanups.push(
			registerMessageEvent(NavigatorSettingsMessageEvent, (_, parser) =>
			{
				const p = parser as NavigatorSettingsMessageParser;
				setHomeRoomId(p.homeRoomId);
			})
		);

		// Top level contexts (tabs)
		cleanups.push(
			registerMessageEvent(NavigatorMetaDataMessageEvent, (_, parser) =>
			{
				const p = parser as NavigatorMetaDataMessageParser;
				setTopLevelContexts([...p.topLevelContexts]);

				// Auto-select first tab if none selected
				if (p.topLevelContexts.length > 0 && !currentSearchCode())
				{
					const firstSearchCode = p.topLevelContexts[0].searchCode;
					setCurrentSearchCode(firstSearchCode);
					managers.newNavigator?.performSearch(firstSearchCode);
				}
			})
		);

		// Flat categories
		cleanups.push(
			registerMessageEvent(UserFlatCatsMessageEvent, (_, parser) =>
			{
				const p = parser as UserFlatCatsMessageParser;
				setFlatCategories(p.nodes.filter((cat) => cat.visible));
			})
		);

		// Event categories
		cleanups.push(
			registerMessageEvent(UserEventCatsMessageEvent, (_, parser) =>
			{
				const p = parser as UserEventCatsMessageParser;
				setEventCategories(p.eventCategories.filter((cat) => cat.visible));
			})
		);

		// Search results
		cleanups.push(
			registerMessageEvent(NavigatorSearchResultSetMessageEvent, (_, parser) =>
			{
				const p = parser as NavigatorSearchResultSetMessageParser;
				setSearchResults(p.searchResult);
			})
		);

		// Legacy search results
		cleanups.push(
			registerMessageEvent(GuestRoomSearchResultMessageEvent, (_, parser) =>
			{
				const p = parser as GuestRoomSearchResultMessageParser;
				setLegacySearchResults(p.data);
			})
		);

		// Popular tags
		cleanups.push(
			registerMessageEvent(PopularRoomTagsResultMessageEvent, (_, parser) =>
			{
				const p = parser as PopularRoomTagsResultMessageParser;
				setPopularTags(p.data);
			})
		);
	}

	function dispose(): void
	{
		cleanups.forEach(fn => fn());
		cleanups.length = 0;
		managers = {navigator: null, newNavigator: null};
	}

	// ========== UI Actions ==========

	function open(): void
	{
		setIsOpen(true);
		managers.newNavigator?.open();
	}

	function close(): void
	{
		setIsOpen(false);
		managers.newNavigator?.close();
	}

	function toggle(): void
	{
		isOpen() ? close() : open();
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
		setIsRoomInfoOpen(prev => !prev);
	}

	function openCreateModal(): void
	{
		setIsCreateModalOpen(true);
		managers.navigator?.startRoomCreation();
	}

	function closeCreateModal(): void
	{
		setIsCreateModalOpen(false);
	}

	// ========== Navigation Actions ==========

	function search(code: string, filtering: string = ''): void
	{
		setCurrentSearchCode(code);
		managers.newNavigator?.performSearch(code, filtering);
	}

	function searchRooms(query: string): void
	{
		managers.navigator?.performTextSearch(query);
	}

	function searchByTag(tag: string): void
	{
		managers.navigator?.performTagSearch(tag);
	}

	function showOwnRooms(): void
	{
		managers.navigator?.showOwnRooms();
	}

	function goToRoom(roomId: number): void
	{
		managers.navigator?.goToPrivateRoom(roomId);
	}

	function goHome(): boolean
	{
		return managers.navigator?.goToHomeRoom() ?? false;
	}

	// ========== Helpers ==========

	function isRoomHome(roomId: number): boolean
	{
		return roomId === homeRoomId();
	}

	// ========== Public API ==========
	return {
		// UI State (reactive)
		isOpen,
		isRoomInfoOpen,
		isCreateModalOpen,

		// Search State (reactive)
		currentSearchCode,
		topLevelContexts,
		searchResults,
		legacySearchResults,
		popularTags,

		// Categories (reactive)
		flatCategories,
		eventCategories,

		// Settings (reactive)
		homeRoomId,

		// UI Actions
		open,
		close,
		toggle,
		openRoomInfo,
		closeRoomInfo,
		toggleRoomInfo,
		openCreateModal,
		closeCreateModal,

		// Navigation Actions
		search,
		searchRooms,
		searchByTag,
		showOwnRooms,
		goToRoom,
		goHome,

		// Helpers
		isRoomHome,

		// Lifecycle
		init,
		dispose,
	};
}

// ========== Singleton Export ==========
export const navigator = createRoot(createNavigatorFeature);
export type Navigator = typeof navigator;
