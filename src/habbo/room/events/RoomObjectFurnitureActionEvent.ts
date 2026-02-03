/**
 * RoomObjectFurnitureActionEvent
 *
 * Based on AS3: com.sulake.habbo.room.events.RoomObjectFurnitureActionEvent
 *
 * Event dispatched for furniture actions (mouse button/arrow changes).
 */
import {RoomObjectEvent} from '@room/events/RoomObjectEvent';
import type {IRoomObject} from '@room/object/IRoomObject';

export class RoomObjectFurnitureActionEvent extends RoomObjectEvent
{
	public static readonly ROFCAE_MOUSE_BUTTON = 'ROFCAE_MOUSE_BUTTON';
	public static readonly ROFCAE_MOUSE_ARROW = 'ROFCAE_MOUSE_ARROW';

	constructor(type: string, object: IRoomObject | null)
	{
		super(type, object);
	}
}
