import type {JSX} from 'solid-js';
import {createMemo, createSignal, onMount, Show} from 'solid-js';
import clsx from 'clsx';
import {NavigatorHeader, NavigatorIcon} from './common';
import type {TabDefinition} from './tabs';
import {NavigatorTabs} from './tabs';
import type {PopularTag} from './search';
import {NavigatorSearch, PopularTags, SearchResults} from './search';
import type {RoomListRoom, RoomListViewMode} from './rooms';
import {RoomList} from './rooms';
import type {Category} from './categories';
import {CategoryList} from './categories';
import {useDraggable, useNavigatorLocalization} from './hooks';

export type NavigatorView = string; // Now dynamic from server

export interface NavigatorTab
{
	searchCode: string;
	label: string;
}

export interface NavigatorWindowProps
{
	// State
	isOpen: boolean;
	currentSearchCode: string;
	tabs: NavigatorTab[];
	searchQuery?: string;
	loading?: boolean;

	// Data
	rooms: RoomListRoom[];
	categories: Category[];
	popularTags: PopularTag[];
	favouriteRoomIds?: Set<number>;

	// Navigation history
	canGoBack?: boolean;
	canGoForward?: boolean;
	onBack?: () => void;
	onForward?: () => void;

	// Callbacks
	onClose?: () => void;
	onTabChange?: (searchCode: string) => void;
	onSearch?: (query: string) => void;
	onClearSearch?: () => void;
	onTagClick?: (tag: string) => void;
	onCategoryClick?: (categoryId: number) => void;
	onRoomClick?: (roomId: number) => void;
	onFavouriteClick?: (roomId: number) => void;
	onInfoClick?: (roomId: number) => void;
	onCreateRoom?: () => void;
	onRefresh?: () => void;

	// View options
	viewMode?: RoomListViewMode;
	onViewModeChange?: (mode: RoomListViewMode) => void;

	// Window options
	draggable?: boolean;
	initialPosition?: { x: number; y: number };

	class?: string;
}

/**
 * Navigator window - main navigator UI container
 */
export function NavigatorWindow(props: NavigatorWindowProps): JSX.Element
{
	const {t, keys} = useNavigatorLocalization();
	const [showCategories, setShowCategories] = createSignal(true);
	let windowRef: HTMLDivElement | undefined;
	let headerRef: HTMLDivElement | undefined;

	// Draggable functionality
	const draggable = useDraggable({
		initialPosition: props.initialPosition ?? {
			x: Math.max(20, (window.innerWidth - 480) / 2),
			y: Math.max(20, (window.innerHeight - 600) / 2),
		},
		constrainToViewport: true,
		viewportPadding: 20,
	});

	onMount(() =>
	{
		if (props.draggable !== false && windowRef)
		{
			draggable.bindDragTarget(windowRef);
			if (headerRef)
			{
				draggable.bindDragHandle(headerRef);
			}
		}
	});

	const viewMode = () => props.viewMode ?? 'cards';
	const isSearchView = () => props.searchQuery && props.searchQuery.length > 0;

	// Convert server tabs to TabDefinition format
	const tabs = createMemo((): TabDefinition[] =>
	{
		return props.tabs.map(tab => ({
			id: tab.searchCode,
			label: tab.label,
		}));
	});

	const handleTabChange = (searchCode: string) =>
	{
		props.onTabChange?.(searchCode);
	};

	const roomsWithFavourites = createMemo(() =>
	{
		if (!props.favouriteRoomIds) return props.rooms;

		return props.rooms.map(room => ({
			...room,
			isFavourite: props.favouriteRoomIds!.has(room.id),
		}));
	});

	return (
		<Show when={props.isOpen}>
			<div
				ref={windowRef}
				class={clsx(
					'flex flex-col w-[480px] h-[600px]',
					'bg-slate-900 border border-slate-700',
					'rounded-xl shadow-2xl overflow-hidden',
					props.draggable !== false && 'fixed z-50',
					draggable.isDragging() && 'select-none',
					props.class
				)}
			>
				{/* Header (drag handle) */}
				<div ref={headerRef}>
					<NavigatorHeader
						title={t(keys.TITLE)}
						icon="compass"
						onClose={props.onClose}
					>
						{/* Header actions */}
						<div class="flex items-center gap-1">
							{/* Back/Forward buttons */}
							<button
								type="button"
								class={clsx(
									'p-1.5 rounded transition-colors',
									props.canGoBack
										? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
										: 'text-slate-600 cursor-not-allowed'
								)}
								onClick={props.onBack}
								disabled={!props.canGoBack}
								title={t(keys.ACTION_BACK)}
								data-no-drag
							>
								<NavigatorIcon name="chevronLeft" size="sm"/>
							</button>
							<button
								type="button"
								class={clsx(
									'p-1.5 rounded transition-colors',
									props.canGoForward
										? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
										: 'text-slate-600 cursor-not-allowed'
								)}
								onClick={props.onForward}
								disabled={!props.canGoForward}
								title={t(keys.ACTION_FORWARD)}
								data-no-drag
							>
								<NavigatorIcon name="chevronRight" size="sm"/>
							</button>

							<div class="w-px h-4 bg-slate-600 mx-1"/>

							<button
								type="button"
								class="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors"
								onClick={props.onRefresh}
								title={t(keys.ACTION_REFRESH)}
								data-no-drag
							>
								<NavigatorIcon name="refresh" size="sm"/>
							</button>
							<button
								type="button"
								class="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors"
								onClick={props.onCreateRoom}
								title={t(keys.CREATE_TITLE)}
								data-no-drag
							>
								<NavigatorIcon name="plus" size="sm"/>
							</button>
						</div>
					</NavigatorHeader>
				</div>

				{/* Tabs */}
				<NavigatorTabs
					tabs={tabs()}
					activeTab={isSearchView() ? '' : props.currentSearchCode}
					onTabChange={handleTabChange}
				/>

				{/* Search bar */}
				<div class="px-4 py-3 border-b border-slate-700/50 bg-slate-800/20">
					<NavigatorSearch
						value={props.searchQuery}
						onSearch={props.onSearch}
						onClear={props.onClearSearch}
						placeholder={t(keys.SEARCH_PLACEHOLDER)}
					/>
				</div>

				{/* Content area */}
				<div class="flex-1 flex overflow-hidden">
					{/* Sidebar (categories) */}
					<Show when={showCategories() && !isSearchView()}>
						<div class="w-52 border-r border-slate-700/30 overflow-y-auto bg-slate-800/20">
							<CategoryList
								categories={props.categories}
								onCategoryClick={props.onCategoryClick}
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
								<Show when={!isSearchView()}>
									<button
										type="button"
										class={clsx(
											'p-1.5 rounded-md transition-colors',
											showCategories()
												? 'text-amber-400 bg-amber-500/10'
												: 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
										)}
										onClick={() => setShowCategories(!showCategories())}
										title={showCategories() ? 'Hide categories' : 'Show categories'}
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
											: 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
									)}
									onClick={() => props.onViewModeChange?.('cards')}
									title="Card view"
								>
									<NavigatorIcon name="grid" size="sm"/>
								</button>
								<button
									type="button"
									class={clsx(
										'p-1.5 rounded-md transition-colors',
										viewMode() === 'compact'
											? 'bg-amber-500/20 text-amber-400'
											: 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
									)}
									onClick={() => props.onViewModeChange?.('compact')}
									title="Compact view"
								>
									<NavigatorIcon name="list" size="sm"/>
								</button>
							</div>
						</div>

						{/* Room list */}
						<div class="flex-1 overflow-y-auto p-4">
							<Show
								when={isSearchView()}
								fallback={
									<RoomList
										rooms={roomsWithFavourites()}
										viewMode={viewMode()}
										loading={props.loading}
										onRoomClick={props.onRoomClick}
										onFavouriteClick={props.onFavouriteClick}
										onInfoClick={props.onInfoClick}
									/>
								}
							>
								<SearchResults
									rooms={roomsWithFavourites()}
									query={props.searchQuery}
									viewMode={viewMode()}
									loading={props.loading}
									onRoomClick={props.onRoomClick}
									onFavouriteClick={props.onFavouriteClick}
									onInfoClick={props.onInfoClick}
								/>
							</Show>
						</div>

						{/* Popular tags (shown when not searching) */}
						<Show when={!isSearchView() && props.popularTags.length > 0}>
							<div class="px-3 py-2 border-t border-slate-700/50">
								<PopularTags
									tags={props.popularTags}
									maxTags={8}
									onTagClick={props.onTagClick}
								/>
							</div>
						</Show>
					</div>
				</div>
			</div>
		</Show>
	);
}
