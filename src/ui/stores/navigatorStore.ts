import {createStore} from 'solid-js/store';
import {registerMessageEvent} from '@ui/hooks/events/useMessageEvent';
import {SendMessageComposer} from "@ui/api/helium/SendMessageComposer";
import {
	NavigatorMetaDataMessageEvent
} from '@habbo/communication/messages/incoming/newnavigator/NavigatorMetaDataMessageEvent';
import {
	NavigatorSearchResultSetMessageEvent
} from '@habbo/communication/messages/incoming/newnavigator/NavigatorSearchResultSetMessageEvent';
import {UserFlatCatsMessageEvent} from '@habbo/communication/messages/incoming/navigator/UserFlatCatsMessageEvent';
import {UserEventCatsMessageEvent} from '@habbo/communication/messages/incoming/navigator/UserEventCatsMessageEvent';
import {
	GuestRoomSearchResultMessageEvent
} from '@habbo/communication/messages/incoming/navigator/GuestRoomSearchResultMessageEvent';
import {
	PopularRoomTagsResultMessageEvent
} from '@habbo/communication/messages/incoming/navigator/PopularRoomTagsResultMessageEvent';
import {
	NavigatorSettingsMessageEvent
} from '@habbo/communication/messages/incoming/navigator/NavigatorSettingsMessageEvent';
import {
	NewNavigatorSearchComposer
} from '@habbo/communication/messages/outgoing/newnavigator/NewNavigatorSearchComposer';
import {
	GetGuestRoomMessageComposer
} from '@habbo/communication/messages/outgoing/navigator/GetGuestRoomMessageComposer';
import {CreateFlatMessageComposer} from '@habbo/communication/messages/outgoing/navigator/CreateFlatMessageComposer';
import type {
	NavigatorMetaDataMessageParser
} from '@habbo/communication/messages/parser/newnavigator/NavigatorMetaDataMessageParser';
import type {
	NavigatorSearchResultSetMessageParser
} from '@habbo/communication/messages/parser/newnavigator/NavigatorSearchResultSetMessageParser';
import type {UserFlatCatsMessageParser} from '@habbo/communication/messages/parser/navigator/UserFlatCatsMessageParser';
import type {
	UserEventCatsMessageParser
} from '@habbo/communication/messages/parser/navigator/UserEventCatsMessageParser';
import type {
	GuestRoomSearchResultMessageParser
} from '@habbo/communication/messages/parser/navigator/GuestRoomSearchResultMessageParser';
import type {
	PopularRoomTagsResultMessageParser
} from '@habbo/communication/messages/parser/navigator/PopularRoomTagsResultMessageParser';
import type {
	NavigatorSettingsMessageParser
} from '@habbo/communication/messages/parser/navigator/NavigatorSettingsMessageParser';
import type {
	NavigatorTopLevelContext
} from '@habbo/communication/messages/incoming/newnavigator/NavigatorTopLevelContext';
import type {
	NavigatorSearchResultSet
} from '@habbo/communication/messages/incoming/newnavigator/NavigatorSearchResultSet';
import type {
	GuestRoomSearchResultData
} from '@habbo/communication/messages/incoming/navigator/GuestRoomSearchResultData';
import type {PopularTagsData} from '@habbo/communication/messages/incoming/navigator/PopularTagsData';
import type {FlatCategory} from '@habbo/communication/messages/incoming/navigator/FlatCategory';
import type {EventCategory} from '@habbo/communication/messages/incoming/navigator/EventCategory';

/**
 * Navigator Store
 *
 * Tracks the navigator UI state and search results.
 * State is updated by incoming server messages registered in init().
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
	roomInfo: any | null;
	state: DoorStateType;
}

interface NavigatorStoreState
{
	isOpen: boolean;
	isRoomInfoOpen: boolean;
	isCreateModalOpen: boolean;
	isRoomLinkOpen: boolean;
	currentSearchCode: string;
	topLevelContexts: NavigatorTopLevelContext[];
	searchResults: NavigatorSearchResultSet | null;
	legacySearchResults: GuestRoomSearchResultData[];
	popularTags: PopularTagsData[];
	flatCategories: FlatCategory[];
	eventCategories: EventCategory[];
	homeRoomId: number;
	doorData: DoorData;
}

const defaultState: NavigatorStoreState = {
	isOpen: false,
	isRoomInfoOpen: false,
	isCreateModalOpen: false,
	isRoomLinkOpen: false,
	currentSearchCode: '',
	topLevelContexts: [],
	searchResults: null,
	legacySearchResults: [],
	popularTags: [],
	flatCategories: [],
	eventCategories: [],
	homeRoomId: 0,
	doorData: {roomInfo: null, state: DoorStateType.NONE},
};

const [state, setState] = createStore<NavigatorStoreState>({...defaultState});

const actions = {
	open()
	{
		setState('isOpen', true);
	},

	close()
	{
		setState('isOpen', false);
	},

	toggle()
	{
		setState('isOpen', (v) => !v);
	},

	openRoomInfo()
	{
		setState('isRoomInfoOpen', true);
	},

	closeRoomInfo()
	{
		setState('isRoomInfoOpen', false);
	},

	openCreateModal()
	{
		setState('isCreateModalOpen', true);
	},

	closeCreateModal()
	{
		setState('isCreateModalOpen', false);
	},

	openRoomLink()
	{
		setState('isRoomLinkOpen', true);
	},

	closeRoomLink()
	{
		setState('isRoomLinkOpen', false);
	},

	search(code: string, query: string)
	{
		SendMessageComposer(new NewNavigatorSearchComposer(code, query));
	},

	goToRoom(roomId: number)
	{
		SendMessageComposer(new GetGuestRoomMessageComposer(roomId, false, true));
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

	toggleRoomLink()
	{
		setState('isRoomLinkOpen', (v) => !v);
	},

	createRoom(name: string, description: string, model: string, categoryId: number, maxUsers: number, tradeMode: number)
	{
		SendMessageComposer(new CreateFlatMessageComposer(name, description, model, categoryId, maxUsers, tradeMode));
	},

	getEnteredRoom(): any | null
	{
		// TODO: Return entered room data from session/room engine
		return null;
	},

	reset()
	{
		setState({...defaultState});
	},
};

function init(): void
{
	registerMessageEvent(NavigatorMetaDataMessageEvent, (event) =>
	{
		const parser = event.getParser<NavigatorMetaDataMessageParser>();

		setState('topLevelContexts', parser.topLevelContexts);
	});

	registerMessageEvent(NavigatorSearchResultSetMessageEvent, (event) =>
	{
		const parser = event.getParser<NavigatorSearchResultSetMessageParser>();

		setState('searchResults', parser.searchResult);

		if (parser.searchResult)
		{
			setState('currentSearchCode', parser.searchResult.searchCode);
		}
	});

	registerMessageEvent(UserFlatCatsMessageEvent, (event) =>
	{
		const parser = event.getParser<UserFlatCatsMessageParser>();

		setState('flatCategories', parser.nodes);
	});

	registerMessageEvent(UserEventCatsMessageEvent, (event) =>
	{
		const parser = event.getParser<UserEventCatsMessageParser>();

		setState('eventCategories', parser.eventCategories);
	});

	registerMessageEvent(GuestRoomSearchResultMessageEvent, (event) =>
	{
		const parser = event.getParser<GuestRoomSearchResultMessageParser>();

		if (parser.data)
		{
			setState('legacySearchResults', (prev) => [...prev, parser.data!]);
		}
	});

	registerMessageEvent(PopularRoomTagsResultMessageEvent, (event) =>
	{
		const parser = event.getParser<PopularRoomTagsResultMessageParser>();

		if (parser.data)
		{
			setState('popularTags', (prev) => [...prev, parser.data!]);
		}
	});

	registerMessageEvent(NavigatorSettingsMessageEvent, (event) =>
	{
		const parser = event.getParser<NavigatorSettingsMessageParser>();

		setState('homeRoomId', parser.homeRoomId);
	});
}

export const navigatorStore = {state, actions, init};
