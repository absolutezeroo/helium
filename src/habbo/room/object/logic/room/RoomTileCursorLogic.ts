/**
 * RoomTileCursorLogic
 *
 * Based on AS3: com.sulake.habbo.room.object.logic.room.RoomTileCursorLogic
 *
 * Logic for the tile cursor (hover indicator).
 */
import {ObjectLogicBase} from '@room/object/logic/ObjectLogicBase';

export class RoomTileCursorLogic extends ObjectLogicBase
{
	override getEventTypes(): string[]
	{
		return [];
	}

	override update(time: number): void
	{
		// Tile cursor follows mouse position
	}
}
