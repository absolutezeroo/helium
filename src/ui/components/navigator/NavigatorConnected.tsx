import type {JSX} from 'solid-js';
import {createMemo, createSignal} from 'solid-js';
import {navigatorStore} from '@/ui/stores/navigatorStore';
import {Navigator} from './Navigator';
import type {RoomListViewMode} from './rooms';
import type {Category} from './categories';
import {mapSearchResultsToListRooms} from './utils';

/**
 * Navigator component connected to the store
 * This bridges the gap between the engine data and UI components
 */
export function NavigatorConnected(): JSX.Element
{
	const [viewMode, setViewMode] = createSignal<RoomListViewMode>('cards');
	const [searchQuery, setSearchQuery] = createSignal('');

	// Transform server tabs to UI format
	const tabs = createMemo(() =>
	{
		return navigatorStore.topLevelContexts().map(ctx => ({
			searchCode: ctx.searchCode,
			label: ctx.searchCode, // searchCode is used as key for localization
		}));
	});

	// Transform search results to RoomListRoom format
	const rooms = createMemo(() =>
	{
		const results = navigatorStore.navigatorSearchResults();
		// TODO: Get favourite IDs from store when available
		return mapSearchResultsToListRooms(results);
	});

	// Transform categories from search result blocks
	const categories = createMemo((): Category[] =>
	{
		const results = navigatorStore.navigatorSearchResults();
		if (!results) return [];

		return results.blocks.map((block, index) => ({
			id: index,
			name: block.text || block.searchCode,
			roomCount: block.guestRooms.length,
		}));
	});

	// Handlers
	const handleClose = () =>
	{
		navigatorStore.closeNavigator();
	};

	const handleTabChange = (searchCode: string) =>
	{
		setSearchQuery('');
		navigatorStore.performSearch(searchCode);
	};

	const handleSearch = (query: string) =>
	{
		setSearchQuery(query);
		if (query.trim())
		{
			navigatorStore.searchRooms(query);
		}
	};

	const handleClearSearch = () =>
	{
		setSearchQuery('');
		// Re-perform current tab search
		const currentCode = navigatorStore.currentSearchCode();
		if (currentCode)
		{
			navigatorStore.performSearch(currentCode);
		}
	};

	const handleTagClick = (tag: string) =>
	{
		navigatorStore.searchByTag(tag);
	};

	const handleRoomClick = (roomId: number) =>
	{
		navigatorStore.goToPrivateRoom(roomId);
	};

	const handleOpenCreateModal = () =>
	{
		navigatorStore.startRoomCreation();
	};

	const handleCloseCreateModal = () =>
	{
		navigatorStore.closeCreateModal();
	};

	const handleRefresh = () =>
	{
		const currentCode = navigatorStore.currentSearchCode();
		if (currentCode)
		{
			navigatorStore.performSearch(currentCode);
		}
	};

	return (
		<Navigator
			isOpen={navigatorStore.isOpen()}
			isRoomInfoOpen={navigatorStore.isRoomInfoOpen()}
			isCreateModalOpen={navigatorStore.isCreateModalOpen()}
			currentSearchCode={navigatorStore.currentSearchCode()}
			tabs={tabs()}
			searchQuery={searchQuery()}
			rooms={rooms()}
			categories={categories()}
			popularTags={[]}
			viewMode={viewMode()}
			onViewModeChange={setViewMode}
			onClose={handleClose}
			onTabChange={handleTabChange}
			onSearch={handleSearch}
			onClearSearch={handleClearSearch}
			onTagClick={handleTagClick}
			onRoomClick={handleRoomClick}
			onRoomEnter={handleRoomClick}
			onOpenCreateModal={handleOpenCreateModal}
			onCloseCreateModal={handleCloseCreateModal}
			onRefresh={handleRefresh}
		/>
	);
}
