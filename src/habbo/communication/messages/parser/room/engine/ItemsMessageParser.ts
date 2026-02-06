/**
 * ItemsMessageParser
 *
 * Based on AS3: com.sulake.habbo.communication.messages.parser.room.engine.ItemsMessageEventParser
 *
 * Parser for room wall items (initial list).
 */
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {FurnitureWallData} from '@habbo/communication/messages/incoming/room/engine/FurnitureWallData';
import {WallDataParser} from './WallDataParser';

export class ItemsMessageParser implements IMessageParser
{
	private _items: FurnitureWallData[] = [];

	get itemCount(): number
	{
		return this._items.length;
	}

	public getItem(index: number): FurnitureWallData | null
	{
		if (index < 0 || index >= this._items.length)
		{
			return null;
		}

		const data = this._items[index];

		if (data !== null)
		{
			data.setReadOnly();
		}

		return data;
	}

	public flush(): boolean
	{
		this._items = [];
		return true;
	}

	public parse(wrapper: IMessageDataWrapper): boolean
	{
		if (wrapper === null)
		{
			return false;
		}

		this._items = [];

		// Read owner name map
		const ownerMap = new Map<number, string>();
		const ownerCount = wrapper.readInt();

		for (let i = 0; i < ownerCount; i++)
		{
			const ownerId = wrapper.readInt();
			const ownerName = wrapper.readString();
			ownerMap.set(ownerId, ownerName);
		}

		// Read items
		const itemCount = wrapper.readInt();

		for (let i = 0; i < itemCount; i++)
		{
			const data = WallDataParser.parseItemData(wrapper);
			data.ownerName = ownerMap.get(data.ownerId) ?? '';
			this._items.push(data);
		}

		return true;
	}
}
