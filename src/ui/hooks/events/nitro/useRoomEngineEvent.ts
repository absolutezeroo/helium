import {getRoomEngine} from '@ui/api/helium';
import {useEventDispatcher} from '../useEventDispatcher';

/**
 * Subscribe to RoomEngine events.
 *
 * @see source_nitro_react/src/hooks/events/nitro/useRoomEngineEvent.tsx
 */
export const useRoomEngineEvent = <T = unknown>(
	type: string | string[],
	handler: (event: T) => void
): void => useEventDispatcher(type, getRoomEngine().events, handler);
