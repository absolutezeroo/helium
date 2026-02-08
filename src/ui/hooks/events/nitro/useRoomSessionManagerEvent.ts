import {getRoomSessionManager} from '@ui/api/helium';
import {useEventDispatcher} from '../useEventDispatcher';

/**
 * Subscribe to RoomSessionManager events.
 *
 * @see source_nitro_react/src/hooks/events/nitro/useRoomSessionManagerEvent.tsx
 */
export const useRoomSessionManagerEvent = <T = unknown>(
	type: string | string[],
	handler: (event: T) => void
): void => useEventDispatcher(type, getRoomSessionManager().events, handler);
