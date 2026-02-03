/**
 * RoomEngineRoomColorEvent
 *
 * Based on AS3: com.sulake.habbo.room.events.RoomEngineRoomColorEvent
 *
 * Event for room color changes.
 */
import {RoomEngineEvent} from './RoomEngineEvent';

export class RoomEngineRoomColorEvent extends RoomEngineEvent
{
	public static readonly RERCE_ROOM_COLOR = 'RERCE_ROOM_COLOR';

	private _color: number;
	private _light: number;
	private _backgroundOnly: boolean;

	constructor(roomId: number, color: number, light: number, backgroundOnly: boolean)
	{
		super(RoomEngineRoomColorEvent.RERCE_ROOM_COLOR, roomId);
		this._color = color;
		this._light = light;
		this._backgroundOnly = backgroundOnly;
	}

	get color(): number
	{
		return this._color;
	}

	get light(): number
	{
		return this._light;
	}

	get backgroundOnly(): boolean
	{
		return this._backgroundOnly;
	}
}
