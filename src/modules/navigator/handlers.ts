// Parser types
import type {
	NavigatorSettingsMessageParser
} from '@habbo/communication/messages/parser/navigator/NavigatorSettingsMessageParser';
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
	NavigatorMetaDataMessageParser
} from '@habbo/communication/messages/parser/newnavigator/NavigatorMetaDataMessageParser';
import type {
	NavigatorSearchResultSetMessageParser
} from '@habbo/communication/messages/parser/newnavigator/NavigatorSearchResultSetMessageParser';
import type {MessageHandlers} from '../core/types';
import type {INavigatorState} from './types';

export const handlers: MessageHandlers<INavigatorState> = {

	/**
	 * Navigator settings received (home room, etc.)
	 */
	NavigatorSettingsMessageEvent: (parser: NavigatorSettingsMessageParser): Partial<INavigatorState> => ({
		homeRoomId: parser.homeRoomId,
	}),

	/**
	 * Top level contexts (navigation tabs) received
	 */
	NavigatorMetaDataMessageEvent: (parser: NavigatorMetaDataMessageParser, state): Partial<INavigatorState> =>
	{
		const contexts = [...parser.topLevelContexts];
		const update: Partial<INavigatorState> = {
			topLevelContexts: contexts,
		};

		// Auto-select first tab if none selected
		if (contexts.length > 0 && !state.currentSearchCode)
		{
			update.currentSearchCode = contexts[0].searchCode;
		}

		return update;
	},

	/**
	 * Flat categories (room categories) received
	 */
	UserFlatCatsMessageEvent: (parser: UserFlatCatsMessageParser): Partial<INavigatorState> => ({
		flatCategories: parser.nodes.filter((cat) => cat.visible),
	}),

	/**
	 * Event categories received
	 */
	UserEventCatsMessageEvent: (parser: UserEventCatsMessageParser): Partial<INavigatorState> => ({
		eventCategories: parser.eventCategories.filter((cat) => cat.visible),
	}),

	/**
	 * New navigator search results received
	 */
	NavigatorSearchResultSetMessageEvent: (parser: NavigatorSearchResultSetMessageParser): Partial<INavigatorState> => ({
		searchResults: parser.searchResult,
	}),

	/**
	 * Legacy navigator search results received
	 */
	GuestRoomSearchResultMessageEvent: (parser: GuestRoomSearchResultMessageParser): Partial<INavigatorState> => ({
		legacySearchResults: parser.data,
	}),

	/**
	 * Popular room tags received
	 */
	PopularRoomTagsResultMessageEvent: (parser: PopularRoomTagsResultMessageParser): Partial<INavigatorState> => ({
		popularTags: parser.data,
	}),
};
