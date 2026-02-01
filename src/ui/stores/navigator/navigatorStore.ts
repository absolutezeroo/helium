import {createRoot, createSignal} from 'solid-js';
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
 *
 * This store holds ONLY reactive state and message listeners.
 * Actions that require managers are handled by UIBridge.
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

	// Cleanup functions
	const cleanupFunctions: Array<() => void> = [];

	// Callback for initial search (set by UIBridge)
	let onInitialSearchCallback: ((searchCode: string) => void) | null = null;

	/**
	 * Initialize message event listeners
	 */
	function init(): void
	{
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

					// Trigger initial search via callback
					onInitialSearchCallback?.(firstSearchCode);
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
	 * Cleanup message event listeners
	 */
	function dispose(): void
	{
		for (const cleanup of cleanupFunctions)
		{
			cleanup();
		}

		cleanupFunctions.length = 0;
		onInitialSearchCallback = null;
	}

	/**
	 * Set callback for initial search (called by UIBridge)
	 */
	function setOnInitialSearch(callback: ((searchCode: string) => void) | null): void
	{
		onInitialSearchCallback = callback;
	}

	// ========== UI State Setters ==========

	function openNavigator(): void
	{
		setIsOpen(true);
	}

	function closeNavigator(): void
	{
		setIsOpen(false);
	}

	function toggleNavigator(): void
	{
		setIsOpen((prev) => !prev);
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
	}

	function closeCreateModal(): void
	{
		setIsCreateModalOpen(false);
	}

	// ========== State Setters (for UIBridge) ==========

	function updateSearchCode(code: string): void
	{
		setCurrentSearchCode(code);
	}

	// ========== Helpers ==========

	function isRoomHome(roomId: number): boolean
	{
		return roomId === homeRoomId();
	}

	return {
		// UI State (reactive)
		isOpen,
		isRoomInfoOpen,
		isCreateModalOpen,

		// Search State (reactive)
		currentSearchCode,
		topLevelContexts,
		navigatorSearchResults,
		legacySearchResults,
		popularTags,

		// Categories (reactive)
		flatCategories,
		eventCategories,

		// Settings (reactive)
		homeRoomId,

		// Lifecycle
		init,
		dispose,
		setOnInitialSearch,

		// UI State Actions (no manager needed)
		openNavigator,
		closeNavigator,
		toggleNavigator,
		openRoomInfo,
		closeRoomInfo,
		toggleRoomInfo,
		openCreateModal,
		closeCreateModal,

		// State Setters (for UIBridge)
		updateSearchCode,

		// Helpers
		isRoomHome,
	};
}

export const navigatorStore = createRoot(createNavigatorStore);
