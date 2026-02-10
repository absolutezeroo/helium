import {RoomDoorMode} from '@habbo/communication/messages/incoming/navigator/GuestRoomData';

import doorbellIcon from '@/assets/images/newnavigator_doormode_doorbell_small.png';
import passwordIcon from '@/assets/images/newnavigator_doormode_password_small.png';
import invisibleIcon from '@/assets/images/newnavigator_doormode_invisible_small.png';

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

	if (ratio >= 92) return 'badge-full';

	if (ratio >= 50) return 'badge-medium';

	if (ratio > 0) return 'badge-low';

	return 'badge-empty';
}

/**
 * Get the Flash asset path for a door mode icon.
 *
 * @see RoomEntryUtils.as _Str_25339
 */
export function getDoorModeAsset(doorMode: number): string
{
	switch (doorMode)
	{
		case RoomDoorMode.DOORBELL: return doorbellIcon;
		case RoomDoorMode.PASSWORD: return passwordIcon;
		case RoomDoorMode.INVISIBLE: return invisibleIcon;
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
