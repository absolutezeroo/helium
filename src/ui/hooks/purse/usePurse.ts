import {ModuleId, useModule} from '@ui/bridge';

/**
 * Convenience hook for currency/purse data from the Session module.
 *
 * @example
 * ```tsx
 * const { credits, diamonds, duckets } = usePurse();
 * ```
 */
export function usePurse()
{
	const {state} = useModule(ModuleId.Session);

	return {
		credits: () => state().activityPoints.get(0) ?? 0,
		diamonds: () => state().activityPoints.get(5) ?? 0,
		duckets: () => state().activityPoints.get(105) ?? 0,
		getCurrency: (type: number) => state().activityPoints.get(type) ?? 0,
	};
}
