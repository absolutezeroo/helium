import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {FurniListItemParser} from '../furni/FurniListItemParser';

export interface ITradingUserItems
{
	userId: number;
	items: FurniListItemParser[];
	numItems: number;
	numCredits: number;
}

/**
 * Parser for trading item list message
 *
 * @see source_as/habbo/communication/messages/parser/inventory/trading/TradingItemListEventParser.as
 */
export class TradingItemListMessageParser implements IMessageParser
{
	private _userOneItems: ITradingUserItems | null = null;

	get userOneItems(): ITradingUserItems | null
	{
		return this._userOneItems;
	}

	private _userTwoItems: ITradingUserItems | null = null;

	get userTwoItems(): ITradingUserItems | null
	{
		return this._userTwoItems;
	}

	public flush(): boolean
	{
		this._userOneItems = null;
		this._userTwoItems = null;
		return true;
	}

	public parse(wrapper: IMessageDataWrapper): boolean
	{
		this._userOneItems = this.parseUserItems(wrapper);
		this._userTwoItems = this.parseUserItems(wrapper);

		return true;
	}

	private parseUserItems(wrapper: IMessageDataWrapper): ITradingUserItems
	{
		const userId = wrapper.readInt();
		const items: FurniListItemParser[] = [];
		const count = wrapper.readInt();

		for (let i = 0; i < count; i++)
		{
			items.push(new FurniListItemParser(wrapper));
		}

		const numItems = wrapper.readInt();
		const numCredits = wrapper.readInt();

		return {userId, items, numItems, numCredits};
	}
}
