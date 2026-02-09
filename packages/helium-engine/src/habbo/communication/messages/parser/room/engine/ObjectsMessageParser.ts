/**
 * ObjectsMessageParser
 *
 * Based on AS3: com.sulake.habbo.communication.messages.parser.room.engine.ObjectsMessageEventParser
 *
 * Parser for room floor furniture objects.
 */
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {FurnitureFloorData} from '@habbo/communication/messages/incoming/room/engine/FurnitureFloorData';
import {FurnitureDataParser} from './FurnitureDataParser';

export class ObjectsMessageParser implements IMessageParser
{
	private _objects: FurnitureFloorData[] = [];

	get objectCount(): number
	{
		return this._objects.length;
	}

	getObject(index: number): FurnitureFloorData | null
	{
		if (index < 0 || index >= this._objects.length)
		{
			return null;
		}

		const data = this._objects[index];

		if (data !== null)
		{
			data.setReadOnly();
		}

		return data;
	}

	flush(): boolean
	{
		this._objects = [];
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (wrapper === null)
		{
			return false;
		}

		this._objects = [];

		// Read owner name map
		const ownerMap = new Map<number, string>();
		const ownerCount = wrapper.readInt();

		for (let i = 0; i < ownerCount; i++)
		{
			const ownerId = wrapper.readInt();
			const ownerName = wrapper.readString();
			ownerMap.set(ownerId, ownerName);
		}

		// Read objects
		const objectCount = wrapper.readInt();

		for (let i = 0; i < objectCount; i++)
		{
			const data = FurnitureDataParser.parseObjectData(wrapper);

			if (data !== null)
			{
				data.ownerName = ownerMap.get(data.ownerId) ?? '';
				this._objects.push(data);
			}
		}

		return true;
	}
}
