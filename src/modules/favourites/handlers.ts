import type {MessageHandlers} from '../core/types';
import type {FavouritesState} from './types';

// Parser types
import type {FavouritesMessageParser} from '@habbo/communication/messages/parser/navigator/FavouritesMessageParser';
import type {FavouriteChangedMessageParser} from '@habbo/communication/messages/parser/navigator/FavouriteChangedMessageParser';

export const handlers: MessageHandlers<FavouritesState> = {

	/**
	 * Full favourites list received
	 */
	FavouritesMessageEvent: (parser: FavouritesMessageParser): Partial<FavouritesState> => ({
		limit: parser.limit,
		roomIds: [...parser.favouriteRoomIds],
	}),

	/**
	 * Single favourite added or removed
	 */
	FavouriteChangedMessageEvent: (parser: FavouriteChangedMessageParser, state): Partial<FavouritesState> =>
	{
		const currentIds = new Set(state.roomIds);

		if (parser.added)
		{
			currentIds.add(parser.flatId);
		}
		else
		{
			currentIds.delete(parser.flatId);
		}

		return {
			roomIds: Array.from(currentIds),
		};
	},
};
