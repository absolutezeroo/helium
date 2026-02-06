import type {JSX} from 'solid-js';
import {createMemo, createSignal, For, Show} from 'solid-js';
import clsx from 'clsx';
import {ModuleId, useActions, useModule} from '../../bridge';
import {useLocalization} from '@/ui/components/common';
import {useDraggable} from '@/ui/hooks';
import {NavigatorHeader, NavigatorIcon} from './common';
import {NavigatorTabsView, NavigatorSearchView, NavigatorSearchResultView} from './views';
import type {NavigatorBlockData, RoomListViewMode} from './views';
import {mapSearchResultsToBlocks} from './utils';

/**
 * NavigatorView - Main navigator component.
 * Connects to the module and renders the navigator window.
 */
export function NavigatorView(): JSX.Element
{
	const t = useLocalization();
	const {state: navigator} = useModule(ModuleId.Navigator);
	const navActions = useActions(ModuleId.Navigator);
	const locActions = useActions(ModuleId.Localization);

	const [viewMode, setViewMode] = createSignal<RoomListViewMode>('compact');
	const [searchQuery, setSearchQuery] = createSignal('');

	const draggable = useDraggable({
		initialPosition: {
			x: Math.max(20, (window.innerWidth - 480) / 2),
			y: Math.max(20, (window.innerHeight - 600) / 2),
		},
		constrainToViewport: true,
		viewportPadding: 20,
	});

	// Derived state
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

	const blocks = createMemo((): NavigatorBlockData[] =>
		mapSearchResultsToBlocks(navigator().searchResults)
	);

	const isSearching = () => searchQuery().length > 0;

	// Handlers
	const handleTabChange = (searchCode: string) =>
	{
		navActions.search(searchCode);
	};

	const handleSearch = (query: string) =>
	{
		setSearchQuery(query);
		if (query.trim()) navActions.searchRooms(query);
	};

	const handleClearSearch = () =>
	{
		setSearchQuery('');
		handleTabChange(navigator().currentSearchCode);
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
		<Show when={navigator().isOpen}>
			<div
				ref={(el) => draggable.bindDragTarget(el)}
				class={clsx(
					'fixed z-50 flex flex-col w-[480px] h-[600px]',
					'bg-slate-900 border border-slate-700',
					'rounded-xl shadow-2xl overflow-hidden',
					draggable.isDragging() && 'select-none'
				)}
			>
				{/* Header */}
				<div ref={(el) => draggable.bindDragHandle(el)}>
					<NavigatorHeader
						title={t('navigator.title', 'Navigator')}
						icon="compass"
						onClose={() => navActions.close()}
					>
						<div class="flex items-center gap-1">
							<button
								type="button"
								class="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
								onClick={handleRefresh}
								title={t('navigator.action.refresh', 'Refresh')}
							>
								<NavigatorIcon name="refresh" size="sm"/>
							</button>
							<button
								type="button"
								class="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
								title={t('navigator.create.title', 'Create room')}
							>
								<NavigatorIcon name="plus" size="sm"/>
							</button>
						</div>
					</NavigatorHeader>
				</div>

				{/* Tabs */}
				<NavigatorTabsView
					tabs={tabs()}
					activeTab={isSearching() ? '' : navigator().currentSearchCode}
					onTabChange={handleTabChange}
				/>

				{/* Search + view controls */}
				<div class="flex items-center gap-2 px-4 py-2.5 border-b border-slate-700/50 bg-slate-800/20">
					<div class="flex-1">
						<NavigatorSearchView
							value={searchQuery()}
							onSearch={handleSearch}
							onClear={handleClearSearch}
							placeholder={t('navigator.search.placeholder', 'Search rooms...')}
						/>
					</div>

					{/* View mode toggle */}
					<div class="flex items-center gap-1 bg-slate-800/60 rounded-lg p-1 flex-shrink-0">
						<button
							type="button"
							class={clsx(
								'p-1.5 rounded-md transition-colors',
								viewMode() === 'cards'
									? 'bg-amber-500/20 text-amber-400'
									: 'text-slate-400 hover:text-slate-200'
							)}
							onClick={() => setViewMode('cards')}
						>
							<NavigatorIcon name="grid" size="sm"/>
						</button>
						<button
							type="button"
							class={clsx(
								'p-1.5 rounded-md transition-colors',
								viewMode() === 'compact'
									? 'bg-amber-500/20 text-amber-400'
									: 'text-slate-400 hover:text-slate-200'
							)}
							onClick={() => setViewMode('compact')}
						>
							<NavigatorIcon name="list" size="sm"/>
						</button>
					</div>
				</div>

				{/* Content - collapsible block sections */}
				<div class="flex-1 overflow-y-auto">
					<Show when={blocks().length === 0}>
						<div class="flex flex-col items-center justify-center py-12 text-center">
							<NavigatorIcon name="room" size="xl" class="text-slate-600 mb-2"/>
							<p class="text-slate-400 text-sm">{t('navigator.search.noresults', 'No rooms found')}</p>
						</div>
					</Show>

					<Show when={blocks().length > 0}>
						<For each={blocks()}>
							{(block) => (
								<NavigatorSearchResultView
									block={block}
									displayMode={viewMode()}
									onRoomClick={handleRoomClick}
								/>
							)}
						</For>
					</Show>
				</div>
			</div>
		</Show>
	);
}
