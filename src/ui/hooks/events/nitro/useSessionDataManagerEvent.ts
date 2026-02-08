import {getSessionDataManager} from '@ui/api/helium';
import {useEventDispatcher} from '../useEventDispatcher';

/**
 * Subscribe to SessionDataManager events.
 *
 * @see source_nitro_react/src/hooks/events/nitro/useSessionDataManagerEvent.tsx
 */
export const useSessionDataManagerEvent = <T = unknown>(
	type: string | string[],
	handler: (event: T) => void
): void => useEventDispatcher(type, getSessionDataManager().events, handler);
