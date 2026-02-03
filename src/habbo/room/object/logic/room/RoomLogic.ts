/**
 * RoomLogic
 *
 * Based on AS3: com.sulake.habbo.room.object.logic.room.RoomLogic
 *
 * Logic for the room object itself (floor/wall planes, masks).
 */
import {ObjectLogicBase} from '@room/object/logic/ObjectLogicBase';
import type {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';

export class RoomLogic extends ObjectLogicBase
{
	private _roomWidth: number = 0;
	private _roomHeight: number = 0;
	private _floorType: string = '';
	private _wallType: string = '';
	private _landscapeType: string = '';

	override initialize(data: unknown): void
	{
		// Parse room configuration
		const config = data as {
			roomWidth?: number;
			roomHeight?: number;
			floorType?: string;
			wallType?: string;
			landscapeType?: string;
		};

		if (config)
		{
			this._roomWidth = config.roomWidth ?? 0;
			this._roomHeight = config.roomHeight ?? 0;
			this._floorType = config.floorType ?? '';
			this._wallType = config.wallType ?? '';
			this._landscapeType = config.landscapeType ?? '';
		}

		const model = this.object?.getModelController();
		if (model)
		{
			model.setNumber('room_width', this._roomWidth, true);
			model.setNumber('room_height', this._roomHeight, true);
			model.setString('room_floor_type', this._floorType, true);
			model.setString('room_wall_type', this._wallType, true);
			model.setString('room_landscape_type', this._landscapeType, true);
		}
	}

	override processUpdateMessage(message: RoomObjectUpdateMessage): void
	{
		super.processUpdateMessage(message);

		// Handle room-specific update messages
		// (floor type changes, wall visibility, etc.)
	}

	override getEventTypes(): string[]
	{
		return [];
	}
}
