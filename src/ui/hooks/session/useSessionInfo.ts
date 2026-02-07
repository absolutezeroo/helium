import {ModuleId, useModule} from '@ui/bridge';

/**
 * Convenience hook for Session module user data.
 *
 * @example
 * ```tsx
 * const { userData, activityPoints } = useSessionInfo();
 * ```
 */
export function useSessionInfo()
{
	const {state} = useModule(ModuleId.Session);

	return {
		userData: () => state().userData,
		activityPoints: () => state().activityPoints,
	};
}
