import {RoomDoorMode} from '@habbo/communication/messages/incoming/navigator/GuestRoomData';

/**
 * Room entry utility functions
 *
 * @see source_as_flash/com/sulake/habbo/navigator/view/search/results/RoomEntryUtils.as
 */

/**
 * Get Bootstrap badge color class based on user ratio.
 *
 * @see RoomEntryUtils.as _Str_24293
 */
export function getUserCounterColor(userCount: number, maxUserCount: number): string
{
	const ratio = maxUserCount > 0 ? (100 * (userCount / maxUserCount)) : 0;

	if (ratio >= 92) return 'bg-danger';

	if (ratio >= 50) return 'bg-warning';

	if (ratio > 0) return 'bg-success';

	return 'bg-primary';
}

/**
 * Get the CSS icon class name for a door mode.
 *
 * @see RoomEntryUtils.as _Str_25339
 */
export function getDoorModeIconClass(doorMode: number): string
{
	switch (doorMode)
	{
		case RoomDoorMode.DOORBELL: return 'icon icon-navigator-room-locked';
		case RoomDoorMode.PASSWORD: return 'icon icon-navigator-room-password';
		case RoomDoorMode.INVISIBLE: return 'icon icon-navigator-room-invisible';
		default: return '';
	}
}

/**
 * Check if a door mode requires special entry (doorbell or password).
 */
export function isDoorModeProtected(doorMode: number): boolean
{
	return doorMode === RoomDoorMode.DOORBELL || doorMode === RoomDoorMode.PASSWORD;
}
