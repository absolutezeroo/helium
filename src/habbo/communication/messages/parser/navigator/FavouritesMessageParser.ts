import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for favourites rooms message
 *
 * @see source_as/habbo/communication/messages/parser/navigator/FavouritesEventParser.as
 */
export class FavouritesMessageParser implements IMessageParser
{
	private _limit: number = 0;

	get limit(): number
	{
		return this._limit;
	}

	private _favouriteRoomIds: number[] = [];

	get favouriteRoomIds(): number[]
	{
		return this._favouriteRoomIds;
	}

	public flush(): boolean
	{
		this._limit = 0;
		this._favouriteRoomIds = [];
		return true;
	}

	public parse(wrapper: IMessageDataWrapper): boolean
	{
		this._limit = wrapper.readInt();
		const count = wrapper.readInt();
		for (let i = 0; i < count; i++)
		{
			this._favouriteRoomIds.push(wrapper.readInt());
		}
		return true;
	}
}
