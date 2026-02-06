import type {JSX} from 'solid-js';
import {createSignal, For, onMount, Show} from 'solid-js';
import clsx from 'clsx';
import {NavigatorHeader, NavigatorIcon} from './common';
import type {TabDefinition} from './tabs';
import {NavigatorTabs} from './tabs';
import {NavigatorSearch} from './search';
import type {NavigatorBlockData, RoomListViewMode} from './rooms';
import {NavigatorBlockSection} from './rooms';
import {useDraggable} from '../../hooks/useDraggable';
import {useNavigatorLocalization} from './hooks';

export interface NavigatorWindowProps
{
	isOpen: boolean;
	tabs: TabDefinition[];
	activeTab: string;
	blocks: NavigatorBlockData[];
	loading?: boolean;

	onClose?: () => void;
	onTabChange?: (id: string) => void;
	onSearch?: (query: string) => void;
	onRoomClick?: (roomId: number) => void;
	onRefresh?: () => void;
	onCreateRoom?: () => void;
}

/**
 * NavigatorWindow - Pure UI component for the navigator window.
 * Displays search results grouped by collapsible blocks (like Habbo's navigator).
 */
export function NavigatorWindow(props: NavigatorWindowProps): JSX.Element
{
	const {t, keys} = useNavigatorLocalization();

	const [viewMode, setViewMode] = createSignal<RoomListViewMode>('compact');
	const [searchQuery, setSearchQuery] = createSignal('');

	let windowRef: HTMLDivElement | undefined;
	let headerRef: HTMLDivElement | undefined;

	const draggable = useDraggable({
		initialPosition: {
			x: Math.max(20, (window.innerWidth - 480) / 2),
			y: Math.max(20, (window.innerHeight - 600) / 2),
		},
		constrainToViewport: true,
		viewportPadding: 20,
	});

	onMount(() =>
	{
		if (windowRef)
		{
			draggable.bindDragTarget(windowRef);

			if (headerRef) draggable.bindDragHandle(headerRef);
		}
	});

	const isSearching = () => searchQuery().length > 0;

	const totalRoomCount = () =>
		props.blocks.reduce((sum, block) => sum + block.rooms.length, 0);

	const handleSearch = (query: string) =>
	{
		setSearchQuery(query);

		if (query.trim()) props.onSearch?.(query);
	};

	const handleClearSearch = () =>
	{
		setSearchQuery('');

		props.onTabChange?.(props.activeTab);
	};

	return (
		<Show when={props.isOpen}>
			<div
				ref={windowRef}
				class={clsx(
					'fixed z-50 flex flex-col w-[480px] h-[600px]',
					'bg-slate-900 border border-slate-700',
					'rounded-xl shadow-2xl overflow-hidden',
					draggable.isDragging() && 'select-none'
				)}
			>
				{/* Header */}
				<div ref={headerRef}>
					<NavigatorHeader
						title={t(keys.TITLE)}
						icon="compass"
						onClose={props.onClose}
					>
						<div class="flex items-center gap-1">
							<button
								type="button"
								class="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
								onClick={props.onRefresh}
								title={t(keys.ACTION_REFRESH)}
							>
								<NavigatorIcon name="refresh" size="sm"/>
							</button>
							<button
								type="button"
								class="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
								onClick={props.onCreateRoom}
								title={t(keys.CREATE_TITLE)}
							>
								<NavigatorIcon name="plus" size="sm"/>
							</button>
						</div>
					</NavigatorHeader>
				</div>

				{/* Tabs */}
				<NavigatorTabs
					tabs={props.tabs}
					activeTab={isSearching() ? '' : props.activeTab}
					onTabChange={(id) => props.onTabChange?.(id)}
				/>

				{/* Search + view controls */}
				<div class="flex items-center gap-2 px-4 py-2.5 border-b border-slate-700/50 bg-slate-800/20">
					<div class="flex-1">
						<NavigatorSearch
							value={searchQuery()}
							onSearch={handleSearch}
							onClear={handleClearSearch}
							placeholder={t(keys.SEARCH_PLACEHOLDER)}
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

				{/* Content - blocks with collapsible sections */}
				<div class="flex-1 overflow-y-auto">
					{/* Loading state */}
					<Show when={props.loading}>
						<div class="p-4 text-center text-sm text-slate-400">
							Loading...
						</div>
					</Show>

					{/* Empty state */}
					<Show when={!props.loading && props.blocks.length === 0}>
						<div class="flex flex-col items-center justify-center py-12 text-center">
							<NavigatorIcon name="room" size="xl" class="text-slate-600 mb-2"/>
							<p class="text-slate-400 text-sm">No rooms found</p>
						</div>
					</Show>

					{/* Block sections */}
					<Show when={!props.loading && props.blocks.length > 0}>
						<For each={props.blocks}>
							{(block) => (
								<NavigatorBlockSection
									block={block}
									displayMode={viewMode()}
									onRoomClick={props.onRoomClick}
								/>
							)}
						</For>
					</Show>
				</div>
			</div>
		</Show>
	);
}
