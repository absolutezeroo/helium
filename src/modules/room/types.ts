import type {GuestRoomData, RoomEventData} from '@habbo/communication/messages/incoming/navigator';

/**
 * Room module state
 */
export interface RoomState
{
	/** Current room data */
	currentRoom: GuestRoomData | null;

	/** Room rating score */
	rating: number;

	/** Whether user can rate this room */
	canRate: boolean;

	/** Whether room is staff picked */
	isStaffPick: boolean;

	/** Current room event (if any) */
	roomEvent: RoomEventData | null;
}
