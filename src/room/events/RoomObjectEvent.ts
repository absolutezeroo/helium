/**
 * RoomObjectEvent
 *
 * Based on AS3: com.sulake.room.events.RoomObjectEvent
 *
 * Event emitted by room objects.
 */
import type {IRoomObject} from '../object/IRoomObject';

export class RoomObjectEvent
{
	private _type: string;
	private _object: IRoomObject | null;

	constructor(type: string, object: IRoomObject | null)
	{
		this._type = type;
		this._object = object;
	}

	get type(): string
	{
		return this._type;
	}

	get object(): IRoomObject | null
	{
		return this._object;
	}

	get objectId(): number
	{
		if (this._object !== null)
		{
			return this._object.getId();
		}

		return -1;
	}

	get objectType(): string | null
	{
		if (this._object !== null)
		{
			return this._object.getType();
		}

		return null;
	}
}
