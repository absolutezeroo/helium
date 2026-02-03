/**
 * RoomObjectStateChangeEvent
 *
 * Based on AS3: com.sulake.habbo.room.events.RoomObjectStateChangeEvent
 *
 * Event dispatched when a room object changes state.
 */
import {RoomObjectEvent} from '@room/events/RoomObjectEvent';
import type {IRoomObject} from '@room/object/IRoomObject';

export class RoomObjectStateChangeEvent extends RoomObjectEvent
{
	public static readonly ROSCE_STATE_CHANGE = 'ROSCE_STATE_CHANGE';

	constructor(type: string, object: IRoomObject | null)
	{
		super(type, object);
	}
}
