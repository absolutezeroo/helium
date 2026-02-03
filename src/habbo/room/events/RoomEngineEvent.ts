/**
 * RoomEngineEvent
 *
 * Based on AS3: com.sulake.habbo.room.events.RoomEngineEvent
 *
 * Base event for room engine events.
 */
export class RoomEngineEvent
{
	public static readonly REE_INITIALIZED = 'REE_INITIALIZED';
	public static readonly REE_DISPOSED = 'REE_DISPOSED';
	public static readonly REE_ENGINE_INITIALIZED = 'REE_ENGINE_INITIALIZED';
	public static readonly REE_ROOM_ZOOMED = 'REE_ROOM_ZOOMED';

	private _type: string;
	private _roomId: number;

	constructor(type: string, roomId: number)
	{
		this._type = type;
		this._roomId = roomId;
	}

	get type(): string
	{
		return this._type;
	}

	get roomId(): number
	{
		return this._roomId;
	}
}
