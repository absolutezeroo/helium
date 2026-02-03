/**
 * RoomObjectDataUpdateMessage
 *
 * Based on AS3: com.sulake.habbo.room.messages.RoomObjectDataUpdateMessage
 *
 * Update message for furniture state and data.
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';
import type {IStuffData} from '../object/data/IStuffData';

export class RoomObjectDataUpdateMessage extends RoomObjectUpdateMessage
{
	private _state: number;
	private _data: IStuffData | null;
	private _extra: number;

	constructor(state: number, data: IStuffData | null, extra: number = NaN)
	{
		super(null, null);
		this._state = state;
		this._data = data;
		this._extra = extra;
	}

	get state(): number
	{
		return this._state;
	}

	get data(): IStuffData | null
	{
		return this._data;
	}

	get extra(): number
	{
		return this._extra;
	}
}
