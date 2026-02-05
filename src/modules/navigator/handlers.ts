import type {MessageHandlers} from '../core/types';
import type {NavigatorState} from './types';

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

export const handlers: MessageHandlers<NavigatorState> = {

	/**
	 * Navigator settings received (home room, etc.)
	 */
	NavigatorSettingsMessageEvent: (parser: NavigatorSettingsMessageParser): Partial<NavigatorState> => ({
		homeRoomId: parser.homeRoomId,
	}),

	/**
	 * Top level contexts (navigation tabs) received
	 */
	NavigatorMetaDataMessageEvent: (parser: NavigatorMetaDataMessageParser, state): Partial<NavigatorState> =>
	{
		const contexts = [...parser.topLevelContexts];
		const update: Partial<NavigatorState> = {
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
	UserFlatCatsMessageEvent: (parser: UserFlatCatsMessageParser): Partial<NavigatorState> => ({
		flatCategories: parser.nodes.filter((cat) => cat.visible),
	}),

	/**
	 * Event categories received
	 */
	UserEventCatsMessageEvent: (parser: UserEventCatsMessageParser): Partial<NavigatorState> => ({
		eventCategories: parser.eventCategories.filter((cat) => cat.visible),
	}),

	/**
	 * New navigator search results received
	 */
	NavigatorSearchResultSetMessageEvent: (parser: NavigatorSearchResultSetMessageParser): Partial<NavigatorState> => ({
		searchResults: parser.searchResult,
	}),

	/**
	 * Legacy navigator search results received
	 */
	GuestRoomSearchResultMessageEvent: (parser: GuestRoomSearchResultMessageParser): Partial<NavigatorState> => ({
		legacySearchResults: parser.data,
	}),

	/**
	 * Popular room tags received
	 */
	PopularRoomTagsResultMessageEvent: (parser: PopularRoomTagsResultMessageParser): Partial<NavigatorState> => ({
		popularTags: parser.data,
	}),
};
