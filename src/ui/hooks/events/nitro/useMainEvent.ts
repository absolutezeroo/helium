import {getCommunication} from '@ui/api/helium';
import {useEventDispatcher} from '../useEventDispatcher';

/**
 * Subscribe to main application events.
 *
 * Uses the HabboCommunicationManager's events as the main event bus
 * (equivalent to Nitro's GetNitroInstance().events).
 *
 * @see source_nitro_react/src/hooks/events/nitro/useMainEvent.tsx
 */
export const useMainEvent = <T = unknown>(
	type: string | string[],
	handler: (event: T) => void
): void => useEventDispatcher(type, getCommunication().events, handler);
