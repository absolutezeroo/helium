import {localizationStore} from '@ui/stores';

/**
 * Navigator-specific localization keys
 */
export const NAV_KEYS = {
	// Window
	TITLE: 'navigator.title',

	// Tabs
	TAB_OFFICIAL: 'navigator.tab.official',
	TAB_HOTEL: 'navigator.tab.hotel',
	TAB_ROOMS: 'navigator.tab.rooms',
	TAB_ME: 'navigator.tab.me',
	TAB_SEARCH: 'navigator.tab.search',

	// Search
	SEARCH_PLACEHOLDER: 'navigator.search.placeholder',
	SEARCH_BUTTON: 'navigator.search.button',
	SEARCH_NO_RESULTS: 'navigator.search.noresults',
	SEARCH_RESULTS_TITLE: 'navigator.search.results',

	// Popular tags
	POPULAR_TAGS_TITLE: 'navigator.populartags.title',

	// Saved searches
	SAVED_SEARCHES_TITLE: 'navigator.savedsearches.title',
	SAVED_SEARCHES_ADD: 'navigator.savedsearches.add',
	SAVED_SEARCHES_EMPTY: 'navigator.savedsearches.empty',

	// Categories
	CATEGORY_EXPAND: 'navigator.category.expand',
	CATEGORY_COLLAPSE: 'navigator.category.collapse',

	// Rooms
	ROOMS_LOADING: 'navigator.rooms.loading',
	ROOMS_EMPTY: 'navigator.rooms.empty',
	ROOM_USERS: 'navigator.room.users',
	ROOM_ENTER: 'navigator.room.enter',
	ROOM_INFO: 'navigator.room.info',
	ROOM_FAVOURITE: 'navigator.room.favourite',
	ROOM_FAVOURITE_ADD: 'navigator.room.favourite.add',
	ROOM_FAVOURITE_REMOVE: 'navigator.room.favourite.remove',
	ROOM_HOME: 'navigator.room.home',
	ROOM_HOME_SET: 'navigator.room.home.set',
	ROOM_HOME_CURRENT: 'navigator.room.home.current',

	// Lifted/Promoted rooms
	LIFTED_ROOMS_TITLE: 'navigator.liftedrooms.title',
	LIFTED_ROOMS_EMPTY: 'navigator.liftedrooms.empty',

	// Room events
	ROOM_EVENTS_TITLE: 'navigator.roomevents.title',
	ROOM_EVENTS_EMPTY: 'navigator.roomevents.empty',

	// Room info
	ROOM_INFO_OWNER: 'navigator.roominfo.owner',
	ROOM_INFO_DESCRIPTION: 'navigator.roominfo.description',
	ROOM_INFO_TAGS: 'navigator.roominfo.tags',
	ROOM_INFO_TRADING: 'navigator.roominfo.trading',
	ROOM_INFO_TRADING_ALLOWED: 'navigator.roominfo.trading.allowed',
	ROOM_INFO_TRADING_NOTALLOWED: 'navigator.roominfo.trading.notallowed',

	// Actions
	ACTION_BACK: 'navigator.action.back',
	ACTION_FORWARD: 'navigator.action.forward',
	ACTION_CLOSE: 'navigator.action.close',
	ACTION_REFRESH: 'navigator.action.refresh',

	// Modals
	PASSWORD_TITLE: 'navigator.password.title',
	PASSWORD_ENTER: 'navigator.password.enter',
	PASSWORD_PLACEHOLDER: 'navigator.password.placeholder',
	PASSWORD_SUBMIT: 'navigator.password.submit',
	PASSWORD_CANCEL: 'navigator.password.cancel',
	PASSWORD_ENTERING: 'navigator.password.entering',
	PASSWORD_ERROR: 'navigator.password.error',

	DOORBELL_TITLE: 'navigator.doorbell.title',
	DOORBELL_WAITING: 'navigator.doorbell.waiting',
	DOORBELL_ACCEPTED: 'navigator.doorbell.accepted',
	DOORBELL_DENIED: 'navigator.doorbell.denied',
	DOORBELL_NO_ANSWER: 'navigator.doorbell.noanswer',
	DOORBELL_CANCEL: 'navigator.doorbell.cancel',
	DOORBELL_ENTERING: 'navigator.doorbell.entering',
	DOORBELL_TRY_AGAIN: 'navigator.doorbell.tryagain',

	// Create room
	CREATE_TITLE: 'navigator.create.title',
	CREATE_NAME: 'navigator.create.name',
	CREATE_DESCRIPTION: 'navigator.create.description',
	CREATE_CATEGORY: 'navigator.create.category',
	CREATE_MODEL: 'navigator.create.model',
	CREATE_SUBMIT: 'navigator.create.submit',
	CREATE_CANCEL: 'navigator.create.cancel',
} as const;

/**
 * Default localization values for Navigator
 */
const DEFAULTS: Record<string, string> = {
	[NAV_KEYS.TITLE]: 'Navigator',
	[NAV_KEYS.TAB_OFFICIAL]: 'Official',
	[NAV_KEYS.TAB_HOTEL]: 'Hotel',
	[NAV_KEYS.TAB_ROOMS]: 'Rooms',
	[NAV_KEYS.TAB_ME]: 'Me',
	[NAV_KEYS.TAB_SEARCH]: 'Search',
	[NAV_KEYS.SEARCH_PLACEHOLDER]: 'Search rooms...',
	[NAV_KEYS.SEARCH_BUTTON]: 'Search',
	[NAV_KEYS.SEARCH_NO_RESULTS]: 'No rooms found',
	[NAV_KEYS.SEARCH_RESULTS_TITLE]: 'Search Results',
	[NAV_KEYS.POPULAR_TAGS_TITLE]: 'Popular Tags',
	[NAV_KEYS.SAVED_SEARCHES_TITLE]: 'Saved Searches',
	[NAV_KEYS.SAVED_SEARCHES_ADD]: 'Save current search',
	[NAV_KEYS.SAVED_SEARCHES_EMPTY]: 'No saved searches',
	[NAV_KEYS.CATEGORY_EXPAND]: 'Expand',
	[NAV_KEYS.CATEGORY_COLLAPSE]: 'Collapse',
	[NAV_KEYS.ROOMS_LOADING]: 'Loading rooms...',
	[NAV_KEYS.ROOMS_EMPTY]: 'No rooms in this category',
	[NAV_KEYS.ROOM_USERS]: 'users',
	[NAV_KEYS.ROOM_ENTER]: 'Enter Room',
	[NAV_KEYS.ROOM_INFO]: 'Room Info',
	[NAV_KEYS.ROOM_FAVOURITE]: 'Favourite',
	[NAV_KEYS.ROOM_FAVOURITE_ADD]: 'Add to favourites',
	[NAV_KEYS.ROOM_FAVOURITE_REMOVE]: 'Remove from favourites',
	[NAV_KEYS.ROOM_HOME]: 'Home Room',
	[NAV_KEYS.ROOM_HOME_SET]: 'Set as home room',
	[NAV_KEYS.ROOM_HOME_CURRENT]: 'Current home room',
	[NAV_KEYS.LIFTED_ROOMS_TITLE]: 'Promoted Rooms',
	[NAV_KEYS.LIFTED_ROOMS_EMPTY]: 'No promoted rooms',
	[NAV_KEYS.ROOM_EVENTS_TITLE]: 'Room Events',
	[NAV_KEYS.ROOM_EVENTS_EMPTY]: 'No events',
	[NAV_KEYS.ROOM_INFO_OWNER]: 'Owner',
	[NAV_KEYS.ROOM_INFO_DESCRIPTION]: 'Description',
	[NAV_KEYS.ROOM_INFO_TAGS]: 'Tags',
	[NAV_KEYS.ROOM_INFO_TRADING]: 'Trading',
	[NAV_KEYS.ROOM_INFO_TRADING_ALLOWED]: 'Allowed',
	[NAV_KEYS.ROOM_INFO_TRADING_NOTALLOWED]: 'Not Allowed',
	[NAV_KEYS.ACTION_BACK]: 'Back',
	[NAV_KEYS.ACTION_FORWARD]: 'Forward',
	[NAV_KEYS.ACTION_CLOSE]: 'Close',
	[NAV_KEYS.ACTION_REFRESH]: 'Refresh',
	[NAV_KEYS.PASSWORD_TITLE]: 'Password Required',
	[NAV_KEYS.PASSWORD_ENTER]: 'Enter room password:',
	[NAV_KEYS.PASSWORD_PLACEHOLDER]: 'Password',
	[NAV_KEYS.PASSWORD_SUBMIT]: 'Enter Room',
	[NAV_KEYS.PASSWORD_CANCEL]: 'Cancel',
	[NAV_KEYS.PASSWORD_ENTERING]: 'Entering...',
	[NAV_KEYS.PASSWORD_ERROR]: 'Incorrect password',
	[NAV_KEYS.DOORBELL_TITLE]: 'Ringing Doorbell',
	[NAV_KEYS.DOORBELL_WAITING]: 'Waiting for response',
	[NAV_KEYS.DOORBELL_ACCEPTED]: 'Access granted',
	[NAV_KEYS.DOORBELL_DENIED]: 'Access denied',
	[NAV_KEYS.DOORBELL_NO_ANSWER]: 'No answer',
	[NAV_KEYS.DOORBELL_CANCEL]: 'Cancel',
	[NAV_KEYS.DOORBELL_ENTERING]: 'Entering...',
	[NAV_KEYS.DOORBELL_TRY_AGAIN]: 'Try Again',
	[NAV_KEYS.CREATE_TITLE]: 'Create Room',
	[NAV_KEYS.CREATE_NAME]: 'Room Name',
	[NAV_KEYS.CREATE_DESCRIPTION]: 'Description',
	[NAV_KEYS.CREATE_CATEGORY]: 'Category',
	[NAV_KEYS.CREATE_MODEL]: 'Room Model',
	[NAV_KEYS.CREATE_SUBMIT]: 'Create',
	[NAV_KEYS.CREATE_CANCEL]: 'Cancel',
};

/**
 * Hook for accessing localized Navigator strings
 */
export function useNavigatorLocalization()
{
	/**
	 * Get a localized string with fallback to default
	 */
	const t = (key: string, defaultValue?: string): string =>
	{
		const fallback = defaultValue ?? DEFAULTS[key] ?? key;
		return localizationStore.get(key, fallback);
	};

	/**
	 * Get a localized string with parameter substitution
	 */
	const tp = (key: string, params: Record<string, string>, defaultValue?: string): string =>
	{
		const fallback = defaultValue ?? DEFAULTS[key] ?? key;
		return localizationStore.getWithParams(key, params, fallback);
	};

	/**
	 * Check if a localization key exists
	 */
	const has = (key: string): boolean =>
	{
		return localizationStore.has(key);
	};

	/**
	 * Check if localization is loaded
	 */
	const isLoaded = () => localizationStore.isLoaded();

	return {
		t,
		tp,
		has,
		isLoaded,
		keys: NAV_KEYS,
	};
}
