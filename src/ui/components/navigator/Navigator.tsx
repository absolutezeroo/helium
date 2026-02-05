import type {JSX} from 'solid-js';
import {createMemo, createSignal} from 'solid-js';
import {ModuleId, useActions, useModule} from '../../bridge';
import {NavigatorWindow} from './NavigatorWindow';
import {RoomCreateModal} from './create';
import type {RoomListRoom} from './rooms';
import type {Category} from './categories';
import {mapSearchResultsToListRooms} from './utils';

/**
 * Navigator - Connects the module to NavigatorWindow
 *
 * Module provides reactive state + actions
 */
export function Navigator(): JSX.Element
{
	const {state: navigator} = useModule(ModuleId.Navigator);
	const {state: localization} = useModule(ModuleId.Localization);
	const navActions = useActions(ModuleId.Navigator);
	const locActions = useActions(ModuleId.Localization);

	const [isCreateModalOpen, setIsCreateModalOpen] = createSignal(false);

	// Transform module data for UI
	const tabs = createMemo(() =>
		navigator().topLevelContexts.map(ctx =>
		{
			const locKey = `navigator.toplevelview.${ctx.searchCode}`;
			const fallback = ctx.searchCode.replace('_view', '').replace(/_/g, ' ');
			return {
				id: ctx.searchCode,
				label: locActions.get(locKey, fallback),
			};
		})
	);

	const rooms = createMemo((): RoomListRoom[] =>
		mapSearchResultsToListRooms(navigator().searchResults)
	);

	const categories = createMemo((): Category[] =>
	{
		const results = navigator().searchResults;
		if (!results) return [];
		return results.blocks.map((block, index) => ({
			id: index,
			name: block.text || block.searchCode,
			roomCount: block.guestRooms.length,
		}));
	});

	// Handlers - use module actions
	const handleTabChange = (searchCode: string) =>
	{
		navActions.search(searchCode);
	};

	const handleSearch = (query: string) =>
	{
		navActions.searchRooms(query);
	};

	const handleRefresh = () =>
	{
		const code = navigator().currentSearchCode;

		if (code) navActions.search(code);
	};

	const handleRoomClick = (roomId: number) =>
	{
		navActions.goToRoom(roomId);
	};

	return (
		<>
			<NavigatorWindow
				isOpen={navigator().isOpen}
				tabs={tabs()}
				activeTab={navigator().currentSearchCode}
				rooms={rooms()}
				categories={categories()}
				onClose={() => navActions.close()}
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
