import {createSignal, createRoot} from 'solid-js';
import type {IHabboNavigator, IHabboNewNavigator} from '@habbo/navigator';
import type {
    GuestRoomData,
    FlatCategory,
    EventCategory,
    GuestRoomSearchResultData,
    PopularTagsData,
    RoomEventData,
} from '@habbo/communication/messages/incoming/navigator';
import type {
    NavigatorTopLevelContext,
    NavigatorSearchResultSet,
} from '@habbo/communication/messages/incoming/newnavigator';
import type {NavigatorData} from '@habbo/navigator/domain';

/**
 * Navigator store state
 */
export interface NavigatorStoreState {
    // UI state
    isOpen: boolean;
    isRoomInfoOpen: boolean;

    // Current room
    currentRoom: GuestRoomData | null;
    currentRoomRating: number;
    canRate: boolean;
    isStaffPick: boolean;
    roomEvent: RoomEventData | null;

    // Settings
    homeRoomId: number;

    // Categories
    flatCategories: FlatCategory[];
    eventCategories: EventCategory[];

    // Search results
    searchResults: GuestRoomSearchResultData | null;
    popularTags: PopularTagsData | null;

    // Favourites
    isFavouritesFull: boolean;
}

/**
 * Creates the navigator store
 */
function createNavigatorStore() {
    // State signals
    const [isOpen, setIsOpen] = createSignal(false);
    const [isRoomInfoOpen, setIsRoomInfoOpen] = createSignal(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = createSignal(false);
    const [currentSearchCode, setCurrentSearchCode] = createSignal<string>('');
    const [topLevelContexts, setTopLevelContexts] = createSignal<NavigatorTopLevelContext[]>([]);
    const [navigatorSearchResults, setNavigatorSearchResults] = createSignal<NavigatorSearchResultSet | null>(null);
    const [currentRoom, setCurrentRoom] = createSignal<GuestRoomData | null>(null);
    const [currentRoomRating, setCurrentRoomRating] = createSignal(0);
    const [canRate, setCanRate] = createSignal(false);
    const [isStaffPick, setIsStaffPick] = createSignal(false);
    const [roomEvent, setRoomEvent] = createSignal<RoomEventData | null>(null);
    const [homeRoomId, setHomeRoomId] = createSignal(0);
    const [flatCategories, setFlatCategories] = createSignal<FlatCategory[]>([]);
    const [eventCategories, setEventCategories] = createSignal<EventCategory[]>([]);
    const [searchResults, setSearchResults] = createSignal<GuestRoomSearchResultData | null>(null);
    const [popularTags, setPopularTags] = createSignal<PopularTagsData | null>(null);
    const [isFavouritesFull, setIsFavouritesFull] = createSignal(false);

    // Navigator references
    let navigator: IHabboNavigator | null = null;
    let newNavigator: IHabboNewNavigator | null = null;
    let data: NavigatorData | null = null;

    /**
     * Connect to the navigators
     */
    function connect(nav: IHabboNavigator, newNav?: IHabboNewNavigator): void {
        navigator = nav;
        newNavigator = newNav ?? null;
        data = nav.data;

        // Listen to legacy navigator events (for room info)
        nav.on('roomInfoOpened', () => setIsRoomInfoOpen(true));
        nav.on('roomInfoClosed', () => setIsRoomInfoOpen(false));

        // Listen to new navigator events (for open/close and search results)
        if (newNav) {
            newNav.on('opened', () => setIsOpen(true));
            newNav.on('closed', () => setIsOpen(false));
            newNav.on('searchResults', (results) => {
                setNavigatorSearchResults(results);
            });
            newNav.on('initialized', () => {
                // Contexts are available after initialization
                const contexts = data!.topLevelContexts;
                setTopLevelContexts([...contexts]);
            });
        }

        // Listen to data events
        data.on('roomEntered', (room) => {
            setCurrentRoom(room);
            setCurrentRoomRating(data!.currentRoomRating);
            setCanRate(data!.canRate);
            setIsStaffPick(data!.currentRoomIsStaffPick);
        });

        data.on('roomExited', () => {
            setCurrentRoom(null);
            setRoomEvent(null);
        });

        data.on('dataChanged', () => {
            setHomeRoomId(data!.homeRoomId);
            setCurrentRoomRating(data!.currentRoomRating);
            setCanRate(data!.canRate);
            setRoomEvent(data!.roomEventData);

            const contexts = data!.topLevelContexts;
            setTopLevelContexts([...contexts]);

            // Auto-select first tab if none selected and contexts available
            if (contexts.length > 0 && !currentSearchCode()) {
                const firstSearchCode = contexts[0].searchCode;
                setCurrentSearchCode(firstSearchCode);
                // Perform initial search
                newNavigator?.performSearch(firstSearchCode);
            }
        });

        data.on('categoriesChanged', () => {
            setFlatCategories([...data!.visibleCategories]);
            setEventCategories([...data!.visibleEventCategories]);
        });

        data.on('searchResultsChanged', () => {
            setSearchResults(data!.guestRoomSearchResults);
            setPopularTags(data!.popularTags);
            setNavigatorSearchResults(data!.navigatorSearchResultSet);
        });

        data.on('favouritesChanged', () => {
            setIsFavouritesFull(data!.isFavouritesFull());
        });
    }

    /**
     * Disconnect from the navigators
     */
    function disconnect(): void {
        if (navigator) {
            navigator.removeAllListeners();
        }
        if (data) {
            data.removeAllListeners();
        }
        navigator = null;
        newNavigator = null;
        data = null;
    }

    // ========== Actions ==========

    function openNavigator(): void {
        // Use new navigator for opening (sends init message on first open)
        newNavigator?.open();
    }

    function closeNavigator(): void {
        newNavigator?.close();
    }

    function toggleRoomInfo(): void {
        navigator?.toggleRoomInfoVisibility();
    }

    function goToHomeRoom(): boolean {
        return navigator?.goToHomeRoom() ?? false;
    }

    function goToPrivateRoom(roomId: number): void {
        navigator?.goToPrivateRoom(roomId);
    }

    function searchRooms(query: string): void {
        navigator?.performTextSearch(query);
    }

    function searchByTag(tag: string): void {
        navigator?.performTagSearch(tag);
    }

    function showOwnRooms(): void {
        navigator?.showOwnRooms();
    }

    function isRoomFavourite(roomId: number): boolean {
        return data?.isRoomFavourite(roomId) ?? false;
    }

    function isRoomHome(roomId: number): boolean {
        return data?.isRoomHome(roomId) ?? false;
    }

    function startRoomCreation(): void {
        setIsCreateModalOpen(true);
        navigator?.startRoomCreation();
    }

    function closeCreateModal(): void {
        setIsCreateModalOpen(false);
    }

    /**
     * Perform a new navigator search (change tab)
     */
    function performSearch(searchCode: string, filtering: string = ''): void {
        setCurrentSearchCode(searchCode);
        newNavigator?.performSearch(searchCode, filtering);
    }

    return {
        // State (reactive)
        isOpen,
        isRoomInfoOpen,
        isCreateModalOpen,
        currentSearchCode,
        topLevelContexts,
        navigatorSearchResults,
        currentRoom,
        currentRoomRating,
        canRate,
        isStaffPick,
        roomEvent,
        homeRoomId,
        flatCategories,
        eventCategories,
        searchResults,
        popularTags,
        isFavouritesFull,

        // Connection
        connect,
        disconnect,

        // Actions
        openNavigator,
        closeNavigator,
        toggleRoomInfo,
        goToHomeRoom,
        goToPrivateRoom,
        searchRooms,
        searchByTag,
        showOwnRooms,
        isRoomFavourite,
        isRoomHome,
        startRoomCreation,
        closeCreateModal,
        performSearch,
    };
}

// Create singleton store
export const navigatorStore = createRoot(createNavigatorStore);
