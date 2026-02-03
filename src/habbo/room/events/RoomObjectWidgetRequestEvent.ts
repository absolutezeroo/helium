/**
 * RoomObjectWidgetRequestEvent
 *
 * Based on AS3: com.sulake.habbo.room.events.RoomObjectWidgetRequestEvent
 *
 * Event dispatched to request opening/closing widgets for room objects.
 */
import {RoomObjectEvent} from '@room/events/RoomObjectEvent';
import type {IRoomObject} from '@room/object/IRoomObject';

export class RoomObjectWidgetRequestEvent extends RoomObjectEvent
{
	public static readonly ROWRE_OPEN_WIDGET = 'ROWRE_OPEN_WIDGET';
	public static readonly ROWRE_CLOSE_WIDGET = 'ROWRE_CLOSE_WIDGET';
	public static readonly ROWRE_OPEN_FURNI_CONTEXT_MENU = 'ROWRE_OPEN_FURNI_CONTEXT_MENU';
	public static readonly ROWRE_CLOSE_FURNI_CONTEXT_MENU = 'ROWRE_CLOSE_FURNI_CONTEXT_MENU';

	constructor(type: string, object: IRoomObject | null)
	{
		super(type, object);
	}
}
