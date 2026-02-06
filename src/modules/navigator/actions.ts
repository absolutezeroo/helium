import type {IHabboNavigator} from '@habbo/navigator/IHabboNavigator';
import type {IHabboNewNavigator} from '@habbo/navigator/IHabboNewNavigator';
import type {IActionContext} from '../core/types';
import type {INavigatorState} from './types';

/**
 * Navigator manager dependencies
 */
export interface INavigatorManagers
{
	navigator: IHabboNavigator;
	newNavigator: IHabboNewNavigator;
}

export function createActions(ctx: IActionContext<INavigatorState, INavigatorManagers>)
{
	const {getState, updateState, managers} = ctx;

	return {
		/**
		 * Open the navigator window
		 */
		open: (): void =>
		{
			updateState({isOpen: true});
			managers.newNavigator.open();
		},

		/**
		 * Close the navigator window
		 */
		close: (): void =>
		{
			updateState({isOpen: false});
			managers.newNavigator.close();
		},

		/**
		 * Toggle the navigator window
		 */
		toggle: (): void =>
		{
			const state = getState();

			if (state.isOpen)
			{
				updateState({isOpen: false});

				managers.newNavigator.close();
			} else
			{
				updateState({isOpen: true});

				managers.newNavigator.open();
			}
		},

		/**
		 * Open the room info panel
		 */
		openRoomInfo: (): void =>
		{
			updateState({isRoomInfoOpen: true});
		},

		/**
		 * Close the room info panel
		 */
		closeRoomInfo: (): void =>
		{
			updateState({isRoomInfoOpen: false});
		},

		/**
		 * Toggle the room info panel
		 */
		toggleRoomInfo: (): void =>
		{
			const state = getState();

			updateState({isRoomInfoOpen: !state.isRoomInfoOpen});
		},

		/**
		 * Open the create room modal
		 */
		openCreateModal: (): void =>
		{
			updateState({isCreateModalOpen: true});

			managers.navigator.startRoomCreation();
		},

		/**
		 * Close the create room modal
		 */
		closeCreateModal: (): void =>
		{
			updateState({isCreateModalOpen: false});
		},

		/**
		 * Perform a search
		 */
		search: (code: string, filtering: string = ''): void =>
		{
			updateState({currentSearchCode: code});

			managers.newNavigator.performSearch(code, filtering);
		},

		/**
		 * Perform a text-based room search
		 */
		searchRooms: (query: string): void =>
		{
			managers.navigator.performTextSearch(query);
		},

		/**
		 * Perform a tag search
		 */
		searchByTag: (tag: string): void =>
		{
			managers.navigator.performTagSearch(tag);
		},

		/**
		 * Show the user's own rooms
		 */
		showOwnRooms: (): void =>
		{
			managers.navigator.showOwnRooms();
		},

		/**
		 * Go to a specific room
		 */
		goToRoom: (roomId: number): void =>
		{
			managers.navigator.goToPrivateRoom(roomId);
		},

		/**
		 * Go to the user's home room
		 * @returns true if successful, false if no home room is set
		 */
		goHome: (): boolean =>
		{
			return managers.navigator.goToHomeRoom();
		},

		/**
		 * Check if a room is the user's home room
		 */
		isRoomHome: (roomId: number): boolean =>
		{
			return roomId === getState().homeRoomId;
		},

		/**
		 * Check if a room is in favourites
		 */
		isRoomFavorite: (roomId: number): boolean =>
		{
			return managers.navigator.isRoomFavorite(roomId);
		},

		/**
		 * Reset navigator state
		 */
		reset: (): void =>
		{
			updateState({
				isOpen: false,
				isRoomInfoOpen: false,
				isCreateModalOpen: false,
				currentSearchCode: '',
				topLevelContexts: [],
				searchResults: null,
				legacySearchResults: null,
				popularTags: null,
				flatCategories: [],
				eventCategories: [],
				homeRoomId: 0,
			});
		},
	};
}

export type NavigatorActions = ReturnType<typeof createActions>;
