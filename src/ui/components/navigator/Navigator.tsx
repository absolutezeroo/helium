import type {JSX} from 'solid-js';
import {createMemo, createSignal} from 'solid-js';
import {localizationStore, navigatorStore} from '@/ui/stores';
import {uiBridge} from '@/ui/uiBridge';
import {NavigatorWindow} from './NavigatorWindow';
import {RoomCreateModal} from './create';
import type {RoomListRoom} from './rooms';
import type {Category} from './categories';
import {mapSearchResultsToListRooms} from './utils';

/**
 * Navigator - Connects the store to NavigatorWindow
 *
 * Store provides reactive state (read-only)
 * UIBridge provides actions (manager calls)
 */
export function Navigator(): JSX.Element
{
	const [isCreateModalOpen, setIsCreateModalOpen] = createSignal(false);

	// Transform store data for UI
	const tabs = createMemo(() =>
		navigatorStore.topLevelContexts().map(ctx =>
		{
			const locKey = `navigator.toplevelview.${ctx.searchCode}`;
			const fallback = ctx.searchCode.replace('_view', '').replace(/_/g, ' ');
			return {
				id: ctx.searchCode,
				label: localizationStore.get(locKey, fallback),
			};
		})
	);

	const rooms = createMemo((): RoomListRoom[] =>
		mapSearchResultsToListRooms(navigatorStore.navigatorSearchResults())
	);

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

	// Handlers - use uiBridge for actions
	const handleTabChange = (searchCode: string) =>
	{
		uiBridge.performNavigatorSearch(searchCode);
	};

	const handleSearch = (query: string) =>
	{
		uiBridge.searchRooms(query);
	};

	const handleRefresh = () =>
	{
		const code = navigatorStore.currentSearchCode();

		if (code) uiBridge.performNavigatorSearch(code);
	};

	const handleRoomClick = (roomId: number) =>
	{
		uiBridge.goToPrivateRoom(roomId);
	};

	return (
		<>
			<NavigatorWindow
				isOpen={navigatorStore.isOpen()}
				tabs={tabs()}
				activeTab={navigatorStore.currentSearchCode()}
				rooms={rooms()}
				categories={categories()}
				onClose={() => uiBridge.closeNavigator()}
				onTabChange={handleTabChange}
				onSearch={handleSearch}
				onRefresh={handleRefresh}
				onRoomClick={handleRoomClick}
				onCreateRoom={() => setIsCreateModalOpen(true)}
			/>

			<RoomCreateModal
				isOpen={isCreateModalOpen()}
				categories={[]}
				models={[]}
				onClose={() => setIsCreateModalOpen(false)}
			/>
		</>
	);
}
