import {createMemo, createSignal} from 'solid-js';
import {navigatorStore} from '@ui/stores';
import type {GuestRoomData} from '@habbo/communication/messages/incoming/navigator';
import type {RoomDisplayMode} from '../types';

/**
 * Hook for room list state and filtering
 */
export function useRoomList() {
    // Local state
    const [displayMode, setDisplayMode] = createSignal<RoomDisplayMode>('list');
    const [sortBy, setSortBy] = createSignal<'name' | 'users' | 'rating'>('users');
    const [sortOrder, setSortOrder] = createSignal<'asc' | 'desc'>('desc');
    const [filterText, setFilterText] = createSignal('');

    // Search results from store
    const searchResults = () => navigatorStore.searchResults();
    const popularTags = () => navigatorStore.popularTags();

    // Get rooms from search results
    const rooms = createMemo(() => {
        const results = searchResults();
        return results?.rooms ?? [];
    });

    // Filtered and sorted rooms
    const filteredRooms = createMemo(() => {
        let result = [...rooms()];
        const filter = filterText().toLowerCase();

        // Apply text filter
        if (filter) {
            result = result.filter(
                (room) =>
                    room.roomName.toLowerCase().includes(filter) ||
                    room.ownerName.toLowerCase().includes(filter) ||
                    room.tags.some((tag) => tag.toLowerCase().includes(filter))
            );
        }

        // Apply sorting
        const order = sortOrder() === 'asc' ? 1 : -1;
        switch (sortBy()) {
            case 'name':
                result.sort((a, b) => a.roomName.localeCompare(b.roomName) * order);
                break;
            case 'users':
                result.sort((a, b) => (a.userCount - b.userCount) * order);
                break;
            case 'rating':
                result.sort((a, b) => (a.score - b.score) * order);
                break;
        }

        return result;
    });

    // Stats
    const totalRooms = createMemo(() => rooms().length);
    const totalUsers = createMemo(() =>
        rooms().reduce((sum, room) => sum + room.userCount, 0)
    );

    // Tags from popular tags
    const tags = createMemo(() => {
        const tagsData = popularTags();
        return tagsData?.tags ?? [];
    });

    // Actions
    const toggleSortOrder = () => {
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    };

    const cycleDisplayMode = () => {
        setDisplayMode((prev) => {
            switch (prev) {
                case 'grid':
                    return 'list';
                case 'list':
                    return 'compact';
                case 'compact':
                    return 'grid';
            }
        });
    };

    return {
        // State
        displayMode,
        setDisplayMode,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        filterText,
        setFilterText,

        // Data
        rooms: filteredRooms,
        allRooms: rooms,
        tags,
        totalRooms,
        totalUsers,

        // Actions
        toggleSortOrder,
        cycleDisplayMode,
    };
}
