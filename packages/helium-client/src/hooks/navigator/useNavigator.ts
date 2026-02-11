import {createStore} from 'solid-js/store';
import {registerMessageEvent} from '@ui/hooks/events/useMessageEvent';
import {getNewNavigator} from '@ui/api/helium/getNewNavigator';
import {
	NavigatorMetaDataMessageEvent
} from '@habbo/communication/messages/incoming/newnavigator/NavigatorMetaDataMessageEvent';
import {
	NavigatorSearchResultSetMessageEvent
} from '@habbo/communication/messages/incoming/newnavigator/NavigatorSearchResultSetMessageEvent';
import {
	NavigatorSavedSearchesMessageEvent
} from '@habbo/communication/messages/incoming/newnavigator/NavigatorSavedSearchesMessageEvent';
import {
	NavigatorCollapsedCategoriesMessageEvent
} from '@habbo/communication/messages/incoming/newnavigator/NavigatorCollapsedCategoriesMessageEvent';
import {
	NavigatorLiftedRoomsMessageEvent
} from '@habbo/communication/messages/incoming/newnavigator/NavigatorLiftedRoomsMessageEvent';
import {
	NavigatorSettingsMessageEvent
} from '@habbo/communication/messages/incoming/navigator/NavigatorSettingsMessageEvent';
import {UserFlatCatsMessageEvent} from '@habbo/communication/messages/incoming/navigator/UserFlatCatsMessageEvent';
import {UserEventCatsMessageEvent} from '@habbo/communication/messages/incoming/navigator/UserEventCatsMessageEvent';
import {DoorbellMessageEvent} from '@habbo/communication/messages/incoming/navigator/DoorbellMessageEvent';
import {
	FlatAccessDeniedMessageEvent
} from '@habbo/communication/messages/incoming/navigator/FlatAccessDeniedMessageEvent';
import {FlatCreatedMessageEvent} from '@habbo/communication/messages/incoming/navigator/FlatCreatedMessageEvent';
import {
	GetGuestRoomResultMessageEvent
} from '@habbo/communication/messages/incoming/navigator/GetGuestRoomResultMessageEvent';
import {
	RoomInfoUpdatedMessageEvent
} from '@habbo/communication/messages/incoming/navigator/RoomInfoUpdatedMessageEvent';
import type {
	NavigatorMetaDataMessageParser
} from '@habbo/communication/messages/parser/newnavigator/NavigatorMetaDataMessageParser';
import type {
	NavigatorSearchResultSetMessageParser
} from '@habbo/communication/messages/parser/newnavigator/NavigatorSearchResultSetMessageParser';
import type {
	NavigatorSavedSearchesMessageParser
} from '@habbo/communication/messages/parser/newnavigator/NavigatorSavedSearchesMessageParser';
import type {
	NavigatorCollapsedCategoriesMessageParser
} from '@habbo/communication/messages/parser/newnavigator/NavigatorCollapsedCategoriesMessageParser';
import type {
	NavigatorLiftedRoomsMessageParser
} from '@habbo/communication/messages/parser/newnavigator/NavigatorLiftedRoomsMessageParser';
import type {
	NavigatorSettingsMessageParser
} from '@habbo/communication/messages/parser/navigator/NavigatorSettingsMessageParser';
import type {UserFlatCatsMessageParser} from '@habbo/communication/messages/parser/navigator/UserFlatCatsMessageParser';
import type {
	UserEventCatsMessageParser
} from '@habbo/communication/messages/parser/navigator/UserEventCatsMessageParser';
import type {DoorbellMessageParser} from '@habbo/communication/messages/parser/navigator/DoorbellMessageParser';
import type {FlatCreatedMessageParser} from '@habbo/communication/messages/parser/navigator/FlatCreatedMessageParser';
import type {
	GetGuestRoomResultMessageParser
} from '@habbo/communication/messages/parser/navigator/GetGuestRoomResultMessageParser';
import type {
	NavigatorTopLevelContext
} from '@habbo/communication/messages/incoming/newnavigator/NavigatorTopLevelContext';
import type {
	NavigatorSearchResultSet
} from '@habbo/communication/messages/incoming/newnavigator/NavigatorSearchResultSet';
import type {NavigatorSavedSearch} from '@habbo/communication/messages/incoming/newnavigator/NavigatorSavedSearch';
import type {
	NavigatorLiftedRoomData
} from '@habbo/communication/messages/incoming/newnavigator/NavigatorLiftedRoomData';
import type {FlatCategory} from '@habbo/communication/messages/incoming/navigator/FlatCategory';
import type {EventCategory} from '@habbo/communication/messages/incoming/navigator/EventCategory';
import type {GuestRoomData} from '@habbo/communication/messages/incoming/navigator/GuestRoomData';
import {ResultsModeEnum} from '@habbo/navigator/view/ResultsModeEnum';

/**
 * Door state enum for doorbell/password flows
 *
 * @see source_as_flash/com/sulake/habbo/navigator/view/GuestRoomDoorbell.as
 * @see source_as_flash/com/sulake/habbo/navigator/view/GuestRoomPasswordInput.as
 */
export const enum DoorStateType
{
	NONE = 0,
	START_DOORBELL = 1,
	START_PASSWORD = 2,
	STATE_WAITING = 3,
	STATE_NO_ANSWER = 4,
	STATE_WRONG_PASSWORD = 5,
	STATE_ACCEPTED = 6,
	STATE_PENDING_SERVER = 7,
}

export interface DoorData
{
	roomInfo: GuestRoomData | null;
	state: DoorStateType;
}

/**
 * Navigator UI state
 *
 * @see source_as_win63/habbo/navigator/view/NavigatorView.as
 * @see source_as_win63/habbo/navigator/HabboNewNavigator.as
 */
interface INavigatorState
{
	isVisible: boolean;
	isReady: boolean;
	topLevelContexts: NavigatorTopLevelContext[];
	currentSearchCode: string;
	searchResult: NavigatorSearchResultSet | null;
	savedSearches: NavigatorSavedSearch[];
	liftedRooms: NavigatorLiftedRoomData[];
	collapsedCategories: string[];
	doorData: DoorData;
	homeRoomId: number;
	flatCategories: FlatCategory[];
	eventCategories: EventCategory[];
	enteredRoomData: GuestRoomData | null;
	isRoomInfoOpen: boolean;
	isRoomLinkOpen: boolean;
	isCreatorOpen: boolean;
}

const defaultState: INavigatorState = {
	isVisible: false,
	isReady: false,
	topLevelContexts: [],
	currentSearchCode: '',
	searchResult: null,
	savedSearches: [],
	liftedRooms: [],
	collapsedCategories: [],
	doorData: {roomInfo: null, state: DoorStateType.NONE},
	homeRoomId: 0,
	flatCategories: [],
	eventCategories: [],
	enteredRoomData: null,
	isRoomInfoOpen: false,
	isRoomLinkOpen: false,
	isCreatorOpen: false,
};

const [state, setState] = createStore<INavigatorState>({...defaultState});

/**
 * Navigator actions that delegate to the HabboNewNavigator engine
 *
 * @see source_as_win63/habbo/navigator/view/NavigatorView.as
 */
const actions = {
	/**
	 * Open the navigator window. Sends init on first open.
	 * @see NavigatorView.as set visible()
	 */
	open()
	{
		const newNav = getNewNavigator();

		newNav.open();
		setState('isVisible', true);
		setState('isCreatorOpen', false);
	},

	close()
	{
		const newNav = getNewNavigator();

		newNav.close();
		setState('isVisible', false);
	},

	/**
	 * Toggle navigator visibility. Refreshes results on every open.
	 * @see HabboNewNavigator.as toggle() line 561-572: performLastSearch() on visible
	 */
	toggle()
	{
		if(state.isVisible)
		{
			actions.close();
		}
		else
		{
			actions.open();

			// AS3: performLastSearch() on every open via toggle
			if(state.isReady && state.searchResult)
			{
				actions.performLastSearch();
			}
		}
	},

	/**
	 * Perform a search via the engine
	 * @see NavigatorView.as → TopViewSelector click → performSearch
	 */
	search(searchCode: string, filtering: string = '')
	{
		const newNav = getNewNavigator();

		newNav.performSearch(searchCode, filtering);
		setState('currentSearchCode', searchCode);
	},

	performLastSearch()
	{
		getNewNavigator().performLastSearch();
	},

	performTagSearch(tag: string)
	{
		getNewNavigator().performTagSearch(tag);
	},

	goBack()
	{
		getNewNavigator().goBack();
	},

	goForward()
	{
		getNewNavigator().goForward();
	},

	/**
	 * Go to a room
	 * @see RoomEntryElementFactory.as click handler
	 */
	goToRoom(roomId: number, _password: string = '')
	{
		getNewNavigator().goToRoom(roomId, 'navigator');
	},

	goToHomeRoom()
	{
		getNewNavigator().goToHomeRoom();
	},

	addSavedSearch(searchCode: string, filtering: string)
	{
		getNewNavigator().addSavedSearch(searchCode, filtering);
	},

	deleteSavedSearch(id: number)
	{
		getNewNavigator().deleteSavedSearch(id);
	},

	addCollapsedCategory(category: string)
	{
		getNewNavigator().addCollapsedCategory(category);
		setState('collapsedCategories', (prev) => [...prev, category]);
	},

	removeCollapsedCategory(category: string)
	{
		getNewNavigator().removeCollapsedCategory(category);
		setState('collapsedCategories', (prev) => prev.filter(c => c !== category));
	},

	toggleCollapsedCategory(category: string)
	{
		if (state.collapsedCategories.includes(category))
		{
			actions.removeCollapsedCategory(category);
		}
		else
		{
			actions.addCollapsedCategory(category);
		}
	},

	/**
	 * Toggle view mode between rows and tiles for a search code block
	 * @see BlockResultsView.as _Str_20474
	 */
	setViewMode(searchCode: string, viewMode: number)
	{
		getNewNavigator().setSearchCodeViewMode(searchCode, viewMode);
	},

	toggleViewMode(searchCode: string, currentMode: number)
	{
		const next = currentMode === ResultsModeEnum.ROWS
			? ResultsModeEnum.TILES
			: ResultsModeEnum.ROWS;

		actions.setViewMode(searchCode, next);
	},

	setDoorData(data: Partial<DoorData> | null)
	{
		if (data === null)
		{
			setState('doorData', {roomInfo: null, state: DoorStateType.NONE});
		}
		else
		{
			setState('doorData', (prev) => ({...prev, ...data}));
		}
	},

	updateDoorState(doorState: DoorStateType)
	{
		setState('doorData', 'state', doorState);
	},

	openRoomInfo()
	{
		setState('isRoomInfoOpen', true);
	},

	closeRoomInfo()
	{
		setState('isRoomInfoOpen', false);
	},

	toggleRoomLink()
	{
		setState('isRoomLinkOpen', (v) => !v);
	},

	closeRoomLink()
	{
		setState('isRoomLinkOpen', false);
	},

	openCreator()
	{
		setState('isCreatorOpen', true);
	},

	closeCreator()
	{
		setState('isCreatorOpen', false);
	},

	createRoom(name: string, description: string, model: string, categoryId: number, maxUsers: number, tradeMode: number)
	{
		getNewNavigator().legacyNavigator.createRoom(name, description, model, categoryId, maxUsers, tradeMode);
	},
};

/**
 * Initialize message event listeners for the navigator
 *
 * @see source_as_win63/habbo/navigator/NewIncomingMessages.as
 */
function init(): void
{
	// New navigator metadata (top level contexts)
	// Note: Engine's NewIncomingMessages handles calling navigator.initialize()
	registerMessageEvent(NavigatorMetaDataMessageEvent, (event) =>
	{
		const parser = event.getParser<NavigatorMetaDataMessageParser>();

		setState('topLevelContexts', parser.topLevelContexts);
		setState('isReady', true);
	});

	// Search results
	// Note: Engine's NewIncomingMessages handles calling navigator.onSearchResult()
	registerMessageEvent(NavigatorSearchResultSetMessageEvent, (event) =>
	{
		const parser = event.getParser<NavigatorSearchResultSetMessageParser>();
		const result = parser.searchResult;

		if (result)
		{
			setState('searchResult', result);
			setState('currentSearchCode', result.searchCode);
		}
	});

	// Saved searches
	// Note: Engine's NewIncomingMessages handles calling navigator.onSavedSearches()
	registerMessageEvent(NavigatorSavedSearchesMessageEvent, (event) =>
	{
		const parser = event.getParser<NavigatorSavedSearchesMessageParser>();

		setState('savedSearches', parser.savedSearches);
	});

	// Collapsed categories
	// Note: Engine's NewIncomingMessages handles calling navigator.onCollapsedCategories()
	registerMessageEvent(NavigatorCollapsedCategoriesMessageEvent, (event) =>
	{
		const parser = event.getParser<NavigatorCollapsedCategoriesMessageParser>();

		setState('collapsedCategories', parser.collapsedCategories);
	});

	// Lifted rooms (promoted rooms)
	// Note: Engine's NewIncomingMessages handles calling navigator.onLiftedRooms()
	registerMessageEvent(NavigatorLiftedRoomsMessageEvent, (event) =>
	{
		const parser = event.getParser<NavigatorLiftedRoomsMessageParser>();

		setState('liftedRooms', parser.liftedRooms);
	});

	// Navigator settings (home room)
	registerMessageEvent(NavigatorSettingsMessageEvent, (event) =>
	{
		const parser = event.getParser<NavigatorSettingsMessageParser>();

		setState('homeRoomId', parser.homeRoomId);

		// Auto-enter home room on first settings message
		if (parser.roomIdToEnter > 0)
		{
			// getNewNavigator().goToRoom(parser.roomIdToEnter, 'external');
		}
	});

	// Flat categories
	registerMessageEvent(UserFlatCatsMessageEvent, (event) =>
	{
		const parser = event.getParser<UserFlatCatsMessageParser>();

		setState('flatCategories', parser.nodes);
	});

	// Event categories
	registerMessageEvent(UserEventCatsMessageEvent, (event) =>
	{
		const parser = event.getParser<UserEventCatsMessageParser>();

		setState('eventCategories', parser.eventCategories);
	});

	// Doorbell
	registerMessageEvent(DoorbellMessageEvent, (event) =>
	{
		const parser = event.getParser<DoorbellMessageParser>();

		// Empty userName = we are ringing someone's door, waiting for response
		if (parser.userName.length === 0)
		{
			setState('doorData', 'state', DoorStateType.STATE_WAITING);
		}
	});

	// Flat access denied
	registerMessageEvent(FlatAccessDeniedMessageEvent, (_event) =>
	{
		const currentState = state.doorData.state;

		if (currentState === DoorStateType.STATE_PENDING_SERVER || currentState === DoorStateType.STATE_WAITING)
		{
			setState('doorData', 'state', DoorStateType.STATE_NO_ANSWER);
		}
	});

	// Flat created → enter the new room
	registerMessageEvent(FlatCreatedMessageEvent, (event) =>
	{
		const parser = event.getParser<FlatCreatedMessageParser>();

		actions.goToRoom(parser.flatId);

		setState('isCreatorOpen', false);
	});

	// Guest room result → update entered room data
	registerMessageEvent(GetGuestRoomResultMessageEvent, (event) =>
	{
		const parser = event.getParser<GetGuestRoomResultMessageParser>();

		if (parser.enterRoom)
		{
			setState('enteredRoomData', parser.data);
		}
		else if (parser.data)
		{
			// Room info update (not entering) → update entered room if same ID
			const current = state.enteredRoomData;

			if (current && current.flatId === parser.data.flatId)
			{
				setState('enteredRoomData', parser.data);
			}
		}
	});

	// Room info updated → refresh if needed
	registerMessageEvent(RoomInfoUpdatedMessageEvent, (_event) =>
	{
		// TODO: Request refreshed room data via GetGuestRoomMessageComposer
		// The server will send a GetGuestRoomResult in response
	});
}

export const useNavigator = () => ({state, actions, init});
