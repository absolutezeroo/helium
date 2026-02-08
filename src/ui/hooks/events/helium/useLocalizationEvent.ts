import {getLocalization} from '@ui/api/helium';
import {useEventDispatcher} from '../useEventDispatcher';

/**
 * Subscribe to HabboLocalizationManager events.
 *
 * @see source_nitro_react/src/hooks/events/nitro/useLocalizationEvent.tsx
 */
export const useLocalizationEvent = <T = unknown>(
	type: string | string[],
	handler: (event: T) => void
): void => useEventDispatcher(type, getLocalization().events, handler);
