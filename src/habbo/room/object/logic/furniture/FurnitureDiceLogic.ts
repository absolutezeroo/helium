/**
 * FurnitureDiceLogic
 *
 * Based on AS3: com.sulake.habbo.room.object.logic.furniture.FurnitureDiceLogic
 *
 * Logic for dice furniture.
 */
import {RoomObjectStateChangeEvent} from '@habbo/room/events/RoomObjectStateChangeEvent';
import {FurnitureLogic} from './FurnitureLogic';

export class FurnitureDiceLogic extends FurnitureLogic
{
	override useObject(): void
	{
		if (this.object === null || this.eventDispatcher === null)
		{
			return;
		}

		// Dice uses state change but doesn't open widgets
		this.eventDispatcher.emit(
			RoomObjectStateChangeEvent.ROSCE_STATE_CHANGE,
			new RoomObjectStateChangeEvent(RoomObjectStateChangeEvent.ROSCE_STATE_CHANGE, this.object)
		);
	}
}
