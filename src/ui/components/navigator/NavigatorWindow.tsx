import type {JSX} from 'solid-js';
import {createSignal, onMount, Show} from 'solid-js';
import clsx from 'clsx';
import {NavigatorHeader, NavigatorIcon} from './common';
import type {ITabDefinition} from './tabs';
import {NavigatorTabs} from './tabs';
import {NavigatorSearch} from './search';
import type {IRoomListRoom, RoomListViewMode} from './rooms';
import {RoomList} from './rooms';
import type {ICategory} from './categories';
import {CategoryList} from './categories';
import {useDraggable, useNavigatorLocalization} from './hooks';

export interface INavigatorWindowProps
{
	isOpen: boolean;
	tabs: ITabDefinition[];
	activeTab: string;
	rooms: IRoomListRoom[];
	categories: ICategory[];
	loading?: boolean;

	onClose?: () => void;
	onTabChange?: (id: string) => void;
	onSearch?: (query: string) => void;
	onRoomClick?: (roomId: number) => void;
	onRefresh?: () => void;
	onCreateRoom?: () => void;
}

/**
 * NavigatorWindow - Pure UI component for the navigator window
 */
export function NavigatorWindow(props: INavigatorWindowProps): JSX.Element
{
	const {t, keys} = useNavigatorLocalization();

	const [viewMode, setViewMode] = createSignal<RoomListViewMode>('cards');
	const [searchQuery, setSearchQuery] = createSignal('');
	const [showCategories, setShowCategories] = createSignal(true);

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

				{/* Search */}
				<div class="px-4 py-3 border-b border-slate-700/50 bg-slate-800/20">
					<NavigatorSearch
						value={searchQuery()}
						onSearch={handleSearch}
						onClear={handleClearSearch}
						placeholder={t(keys.SEARCH_PLACEHOLDER)}
					/>
				</div>

				{/* Content */}
				<div class="flex-1 flex overflow-hidden">
					{/* Categories sidebar */}
					<Show when={showCategories() && !isSearching()}>
						<div class="w-52 border-r border-slate-700/30 overflow-y-auto bg-slate-800/20">
							<CategoryList
								categories={props.categories}
								loading={props.loading}
								class="py-2"
							/>
						</div>
					</Show>

					{/* Main content */}
					<div class="flex-1 flex flex-col overflow-hidden">
						{/* View controls */}
						<div
							class="flex items-center justify-between px-4 py-2.5 border-b border-slate-700/30 bg-slate-800/30">
							<div class="flex items-center gap-3">
								<Show when={!isSearching()}>
									<button
										type="button"
										class={clsx(
											'p-1.5 rounded-md transition-colors',
											showCategories()
												? 'text-amber-400 bg-amber-500/10'
												: 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
										)}
										onClick={() => setShowCategories(!showCategories())}
									>
										<NavigatorIcon name="menu" size="sm"/>
									</button>
								</Show>
								<span class="text-xs text-slate-500 font-medium">
									{props.rooms.length} rooms
								</span>
							</div>

							{/* View mode toggle */}
							<div class="flex items-center gap-1 bg-slate-800/60 rounded-lg p-1">
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

						{/* Room list */}
						<div class="flex-1 overflow-y-auto p-4">
							<RoomList
								rooms={props.rooms}
								viewMode={viewMode()}
								loading={props.loading}
								onRoomClick={props.onRoomClick}
							/>
						</div>
					</div>
				</div>
			</div>
		</Show>
	);
}
