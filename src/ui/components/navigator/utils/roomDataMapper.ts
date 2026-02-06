import type {GuestRoomData} from '@habbo/communication/messages/incoming/navigator';
import type {NavigatorSearchResultSet} from '@habbo/communication/messages/incoming/newnavigator';
import type {IRoomListRoom} from '../rooms';

/**
 * Map door mode number to string type
 */
function mapDoorMode(doorMode: number): IRoomListRoom['doorMode']
{
	switch (doorMode)
	{
		case 0:
			return 'open';
		case 1:
			return 'doorbell';
		case 2:
			return 'password';
		case 3:
			return 'invisible';
		default:
			return 'open';
	}
}

/**
 * Convert a GuestRoomData to IRoomListRoom format for UI display
 */
export function mapGuestRoomToListRoom(room: GuestRoomData, isFavourite?: boolean): IRoomListRoom
{
	return {
		id: room.flatId,
		name: room.roomName,
		ownerName: room.ownerName,
		description: room.description || undefined,
		userCount: room.userCount,
		maxUserCount: room.maxUserCount,
		thumbnail: room.officialRoomPicRef || undefined,
		tags: room.tags.length > 0 ? room.tags : undefined,
		isFavourite: isFavourite,
		isGroupRoom: room.habboGroupId > 0,
		isStaffPick: false, // Not available in GuestRoomData directly
		doorMode: mapDoorMode(room.doorMode),
		score: room.score,
		categoryId: room.categoryId,
	};
}

/**
 * Convert an array of GuestRoomData to IRoomListRoom[]
 */
export function mapGuestRoomsToListRooms(
	rooms: GuestRoomData[],
	favouriteIds?: Set<number>
): IRoomListRoom[]
{
	return rooms.map(room => mapGuestRoomToListRoom(
		room,
		favouriteIds?.has(room.flatId)
	));
}

/**
 * Extract all rooms from NavigatorSearchResultSet and convert to IRoomListRoom[]
 */
export function mapSearchResultsToListRooms(
	results: NavigatorSearchResultSet | null,
	favouriteIds?: Set<number>
): IRoomListRoom[]
{
	if (!results) return [];

	const allRooms = results.getAllRooms();
	return mapGuestRoomsToListRooms(allRooms, favouriteIds);
}
