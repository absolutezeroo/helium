import type {JSX} from 'solid-js';
import {createMemo, createSignal, Show} from 'solid-js';
import {NavigatorHeader, NavigatorIcon} from './common';
import type {TabDefinition} from './tabs';
import {NavigatorTabs} from './tabs';
import type {PopularTag} from './search';
import {NavigatorSearch, PopularTags, SearchResults} from './search';
import type {RoomListRoom, RoomListViewMode} from './rooms';
import {RoomList} from './rooms';
import type {Category} from './categories';
import {CategoryList} from './categories';

export type NavigatorView = string; // Now dynamic from server

export interface NavigatorTab {
    searchCode: string;
    label: string;
}

export interface NavigatorWindowProps {
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

    class?: string;
}

/**
 * Navigator window - main navigator UI container
 */
export function NavigatorWindow(props: NavigatorWindowProps): JSX.Element {
    const [showCategories, setShowCategories] = createSignal(true);

    const viewMode = () => props.viewMode ?? 'cards';
    const isSearchView = () => props.searchQuery && props.searchQuery.length > 0;

    // Convert server tabs to TabDefinition format
    const tabs = createMemo((): TabDefinition[] => {
        return props.tabs.map(tab => ({
            id: tab.searchCode,
            label: tab.label,
        }));
    });

    const handleTabChange = (searchCode: string) => {
        props.onTabChange?.(searchCode);
    };

    const roomsWithFavourites = createMemo(() => {
        if (!props.favouriteRoomIds) return props.rooms;
        return props.rooms.map(room => ({
            ...room,
            isFavourite: props.favouriteRoomIds!.has(room.id),
        }));
    });

    return (
        <Show when={props.isOpen}>
            <div
                class={`
                    flex flex-col
                    w-[480px] h-[600px]
                    bg-slate-900 border border-slate-700
                    rounded-xl shadow-2xl
                    overflow-hidden
                    ${props.class ?? ''}
                `}
            >
                {/* Header */}
                <NavigatorHeader
                    title="Navigator"
                    icon="compass"
                    onClose={props.onClose}
                >
                    {/* Header actions */}
                    <div class="flex items-center gap-1">
                        <button
                            type="button"
                            class="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors"
                            onClick={props.onRefresh}
                            title="Refresh"
                        >
                            <NavigatorIcon name="refresh" size="sm" />
                        </button>
                        <button
                            type="button"
                            class="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors"
                            onClick={props.onCreateRoom}
                            title="Create Room"
                        >
                            <NavigatorIcon name="plus" size="sm" />
                        </button>
                    </div>
                </NavigatorHeader>

                {/* Tabs */}
                <NavigatorTabs
                    tabs={tabs()}
                    activeTab={isSearchView() ? '' : props.currentSearchCode}
                    onTabChange={handleTabChange}
                />

                {/* Search bar */}
                <div class="px-3 py-2 border-b border-slate-700/50">
                    <NavigatorSearch
                        value={props.searchQuery}
                        onSearch={props.onSearch}
                        onClear={props.onClearSearch}
                        placeholder="Search rooms by name or owner..."
                    />
                </div>

                {/* Content area */}
                <div class="flex-1 flex overflow-hidden">
                    {/* Sidebar (categories) */}
                    <Show when={showCategories() && !isSearchView()}>
                        <div class="w-48 border-r border-slate-700/50 overflow-y-auto">
                            <CategoryList
                                categories={props.categories}
                                onCategoryClick={props.onCategoryClick}
                                loading={props.loading}
                            />
                        </div>
                    </Show>

                    {/* Main content */}
                    <div class="flex-1 flex flex-col overflow-hidden">
                        {/* View controls */}
                        <div class="flex items-center justify-between px-3 py-2 border-b border-slate-700/50">
                            <div class="flex items-center gap-2">
                                <Show when={!isSearchView()}>
                                    <button
                                        type="button"
                                        class={`
                                            p-1 rounded
                                            ${showCategories() ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-slate-200'}
                                            transition-colors
                                        `}
                                        onClick={() => setShowCategories(!showCategories())}
                                        title={showCategories() ? 'Hide categories' : 'Show categories'}
                                    >
                                        <NavigatorIcon name="menu" size="sm" />
                                    </button>
                                </Show>
                                <span class="text-xs text-slate-500">
                                    {props.rooms.length} rooms
                                </span>
                            </div>

                            {/* View mode toggle */}
                            <div class="flex items-center gap-1 bg-slate-800 rounded-lg p-0.5">
                                <button
                                    type="button"
                                    class={`
                                        p-1 rounded
                                        ${viewMode() === 'cards' ? 'bg-slate-700 text-slate-200' : 'text-slate-400 hover:text-slate-200'}
                                        transition-colors
                                    `}
                                    onClick={() => props.onViewModeChange?.('cards')}
                                    title="Card view"
                                >
                                    <NavigatorIcon name="grid" size="sm" />
                                </button>
                                <button
                                    type="button"
                                    class={`
                                        p-1 rounded
                                        ${viewMode() === 'compact' ? 'bg-slate-700 text-slate-200' : 'text-slate-400 hover:text-slate-200'}
                                        transition-colors
                                    `}
                                    onClick={() => props.onViewModeChange?.('compact')}
                                    title="Compact view"
                                >
                                    <NavigatorIcon name="list" size="sm" />
                                </button>
                            </div>
                        </div>

                        {/* Room list */}
                        <div class="flex-1 overflow-y-auto p-3">
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
