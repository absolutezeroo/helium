import type {FavouritesMessageParser} from '@habbo/communication/messages/parser/navigator/FavouritesMessageParser';
import type {
	FavouriteChangedMessageParser
} from '@habbo/communication/messages/parser/navigator/FavouriteChangedMessageParser';
import type {MessageHandlers} from '../core/types';
import type {IFavouritesState} from './types';

export const handlers: MessageHandlers<IFavouritesState> = {

	/**
	 * Full favourites list received
	 */
	FavouritesMessageEvent: (parser: FavouritesMessageParser): Partial<IFavouritesState> => ({
		limit: parser.limit,
		roomIds: [...parser.favouriteRoomIds],
	}),

	/**
	 * Single favourite added or removed
	 */
	FavouriteChangedMessageEvent: (parser: FavouriteChangedMessageParser, state): Partial<IFavouritesState> =>
	{
		const currentIds = new Set(state.roomIds);

		if (parser.added)
		{
			currentIds.add(parser.flatId);
		} else
		{
			currentIds.delete(parser.flatId);
		}

		return {
			roomIds: Array.from(currentIds),
		};
	},
};
