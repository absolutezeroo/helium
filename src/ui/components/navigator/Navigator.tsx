import type {JSX} from 'solid-js';
import {Show, createSignal, createEffect, createMemo} from 'solid-js';
import {NavigatorWindow} from './NavigatorWindow';
import type {NavigatorView} from './NavigatorWindow';
import {RoomInfoPanel} from './roominfo';
import type {RoomInfoData} from './roominfo';
import {RoomCreateModal} from './create';
import type {RoomCreateFormData} from './create';
import type {RoomListRoom, RoomListViewMode} from './rooms';
import type {Category} from './categories';
import type {PopularTag} from './search';
import type {RoomCategory, RoomModel} from './create';

export interface NavigatorTab {
    searchCode: string;
    label: string;
}

export interface NavigatorProps {
    // State from store
    isOpen: boolean;
    isRoomInfoOpen?: boolean;
    isCreateModalOpen?: boolean;
    currentSearchCode?: string;
    tabs?: NavigatorTab[];
    searchQuery?: string;
    loading?: boolean;

    // Data from store
    rooms?: RoomListRoom[];
    categories?: Category[];
    popularTags?: PopularTag[];
    favouriteRoomIds?: Set<number>;
    selectedRoom?: RoomInfoData | null;

    // Room creation data
    roomCategories?: RoomCategory[];
    roomModels?: RoomModel[];
    createRoomLoading?: boolean;
    createRoomError?: string;

    // Navigation callbacks
    onClose?: () => void;
    onTabChange?: (searchCode: string) => void;
    onSearch?: (query: string) => void;
    onClearSearch?: () => void;
    onTagClick?: (tag: string) => void;
    onCategoryClick?: (categoryId: number) => void;

    // Room interaction callbacks
    onRoomClick?: (roomId: number) => void;
    onRoomEnter?: (roomId: number) => void;
    onFavouriteToggle?: (roomId: number) => void;
    onSetHomeRoom?: (roomId: number) => void;
    onRateRoom?: (roomId: number, rating: number) => void;
    onEditRoom?: (roomId: number) => void;
    onDeleteRoom?: (roomId: number) => void;
    onReportRoom?: (roomId: number) => void;
    onOwnerClick?: (ownerId: number) => void;

    // Room info panel callbacks
    onRoomInfoClose?: () => void;

    // Room creation callbacks
    onOpenCreateModal?: () => void;
    onCloseCreateModal?: () => void;
    onCreateRoom?: (data: RoomCreateFormData) => void;

    // Other callbacks
    onRefresh?: () => void;

    // View options
    viewMode?: RoomListViewMode;
    onViewModeChange?: (mode: RoomListViewMode) => void;

    class?: string;
}

/**
 * Main Navigator component - orchestrates all navigator UI
 */
export function Navigator(props: NavigatorProps): JSX.Element {
    const currentSearchCode = () => props.currentSearchCode ?? '';
    const tabs = () => props.tabs ?? [];
    const rooms = () => props.rooms ?? [];
    const categories = () => props.categories ?? [];
    const popularTags = () => props.popularTags ?? [];
    const roomCategories = () => props.roomCategories ?? [];
    const roomModels = () => props.roomModels ?? [];

    return (
        <div class={`relative ${props.class ?? ''}`}>
            {/* Main Navigator Window */}
            <NavigatorWindow
                isOpen={props.isOpen}
                currentSearchCode={currentSearchCode()}
                tabs={tabs()}
                searchQuery={props.searchQuery}
                loading={props.loading}
                rooms={rooms()}
                categories={categories()}
                popularTags={popularTags()}
                favouriteRoomIds={props.favouriteRoomIds}
                onClose={props.onClose}
                onTabChange={props.onTabChange}
                onSearch={props.onSearch}
                onClearSearch={props.onClearSearch}
                onTagClick={props.onTagClick}
                onCategoryClick={props.onCategoryClick}
                onRoomClick={props.onRoomClick}
                onFavouriteClick={props.onFavouriteToggle}
                onInfoClick={props.onRoomClick}
                onCreateRoom={props.onOpenCreateModal}
                onRefresh={props.onRefresh}
                viewMode={props.viewMode}
                onViewModeChange={props.onViewModeChange}
            />

            {/* Room Info Panel (side panel) */}
            <Show when={props.isRoomInfoOpen && props.selectedRoom}>
                <div class="absolute top-0 left-full ml-2">
                    <RoomInfoPanel
                        room={props.selectedRoom!}
                        onClose={props.onRoomInfoClose}
                        onOwnerClick={props.onOwnerClick}
                        onTagClick={props.onTagClick}
                        onEnterRoom={props.onRoomEnter}
                        onToggleFavourite={props.onFavouriteToggle}
                        onSetHome={props.onSetHomeRoom}
                        onRate={props.onRateRoom}
                        onEdit={props.onEditRoom}
                        onDelete={props.onDeleteRoom}
                        onReport={props.onReportRoom}
                        class="w-80 h-[600px]"
                    />
                </div>
            </Show>

            {/* Create Room Modal */}
            <RoomCreateModal
                isOpen={props.isCreateModalOpen ?? false}
                categories={roomCategories()}
                models={roomModels()}
                loading={props.createRoomLoading}
                error={props.createRoomError}
                onSubmit={props.onCreateRoom}
                onClose={props.onCloseCreateModal}
            />
        </div>
    );
}
