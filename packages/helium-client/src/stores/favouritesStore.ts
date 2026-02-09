import {createStore} from 'solid-js/store';
import {registerMessageEvent} from '@ui/hooks/events/useMessageEvent';
import {FavouritesMessageEvent} from '@habbo/communication/messages/incoming/navigator/FavouritesMessageEvent';
import {FavouriteChangedMessageEvent} from '@habbo/communication/messages/incoming/navigator/FavouriteChangedMessageEvent';
import type {FavouritesMessageParser} from '@habbo/communication/messages/parser/navigator/FavouritesMessageParser';
import type {FavouriteChangedMessageParser} from '@habbo/communication/messages/parser/navigator/FavouriteChangedMessageParser';

/**
 * Favourites Store
 *
 * Tracks the user's favourite rooms list and provides
 * helper actions to query favourite status and capacity.
 *
 * State is updated by incoming server messages registered in init().
 */

interface FavouritesStoreState
{
	limit: number;
	roomIds: number[];
}

const [state, setState] = createStore<FavouritesStoreState>({
	limit: 0,
	roomIds: [],
});

const actions = {
	isRoomFavourite(roomId: number): boolean
	{
		return state.roomIds.includes(roomId);
	},

	isFull(): boolean
	{
		return state.roomIds.length >= state.limit;
	},

	count(): number
	{
		return state.roomIds.length;
	},
};

function init(): void
{
	registerMessageEvent(FavouritesMessageEvent, (event) =>
	{
		const parser = event.getParser<FavouritesMessageParser>();

		setState({
			limit: parser.limit,
			roomIds: parser.favouriteRoomIds,
		});
	});

	registerMessageEvent(FavouriteChangedMessageEvent, (event) =>
	{
		const parser = event.getParser<FavouriteChangedMessageParser>();

		if (parser.added)
		{
			if (!state.roomIds.includes(parser.flatId))
			{
				setState('roomIds', (prev) => [...prev, parser.flatId]);
			}
		}
		else
		{
			setState('roomIds', (prev) => prev.filter((id) => id !== parser.flatId));
		}
	});
}

export const favouritesStore = {state, actions, init};
