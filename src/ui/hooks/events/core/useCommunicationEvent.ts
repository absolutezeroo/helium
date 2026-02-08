import {getCommunication} from '@ui/api/helium';
import {useEventDispatcher} from '../useEventDispatcher';

/**
 * Subscribe to HabboCommunicationManager events (e.g. AUTHENTICATED, HANDSHAKED).
 *
 * @see source_nitro_react/src/hooks/events/core/useCommunicationEvent.tsx
 */
export const useCommunicationEvent = <T = unknown>(
	type: string | string[],
	handler: (event: T) => void
): void => useEventDispatcher(type, getCommunication().events, handler);
