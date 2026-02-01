import type {JSX} from 'solid-js';
import {createMemo, createSignal} from 'solid-js';
import {navigator, localization} from '@/features';
import {NavigatorWindow} from './NavigatorWindow';
import {RoomCreateModal} from './create';
import type {RoomListRoom} from './rooms';
import type {Category} from './categories';
import {mapSearchResultsToListRooms} from './utils';

/**
 * Navigator - Connects the feature to NavigatorWindow
 *
 * Feature provides reactive state + actions
 */
export function Navigator(): JSX.Element
{
	const [isCreateModalOpen, setIsCreateModalOpen] = createSignal(false);

	// Transform feature data for UI
	const tabs = createMemo(() =>
		navigator.topLevelContexts().map(ctx =>
		{
			const locKey = `navigator.toplevelview.${ctx.searchCode}`;
			const fallback = ctx.searchCode.replace('_view', '').replace(/_/g, ' ');
			return {
				id: ctx.searchCode,
				label: localization.get(locKey, fallback),
			};
		})
	);

	const rooms = createMemo((): RoomListRoom[] =>
		mapSearchResultsToListRooms(navigator.searchResults())
	);

	const categories = createMemo((): Category[] =>
	{
		const results = navigator.searchResults();
		if (!results) return [];
		return results.blocks.map((block, index) => ({
			id: index,
			name: block.text || block.searchCode,
			roomCount: block.guestRooms.length,
		}));
	});

	// Handlers - use feature actions
	const handleTabChange = (searchCode: string) =>
	{
		navigator.search(searchCode);
	};

	const handleSearch = (query: string) =>
	{
		navigator.searchRooms(query);
	};

	const handleRefresh = () =>
	{
		const code = navigator.currentSearchCode();

		if (code) navigator.search(code);
	};

	const handleRoomClick = (roomId: number) =>
	{
		navigator.goToRoom(roomId);
	};

	return (
		<>
			<NavigatorWindow
				isOpen={navigator.isOpen()}
				tabs={tabs()}
				activeTab={navigator.currentSearchCode()}
				rooms={rooms()}
				categories={categories()}
				onClose={() => navigator.close()}
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
