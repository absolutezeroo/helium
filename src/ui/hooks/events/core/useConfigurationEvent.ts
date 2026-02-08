import {getConfiguration} from '@ui/api/helium';
import {useEventDispatcher} from '../useEventDispatcher';

/**
 * Subscribe to HabboConfigurationManager events.
 *
 * @see source_nitro_react/src/hooks/events/core/useConfigurationEvent.tsx
 */
export const useConfigurationEvent = <T = unknown>(
	type: string | string[],
	handler: (event: T) => void
): void => useEventDispatcher(type, getConfiguration().events, handler);
