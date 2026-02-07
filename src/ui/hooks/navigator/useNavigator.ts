import {ModuleId, useActions, useModule} from '@ui/bridge';

/**
 * Convenience hook for Navigator module.
 *
 * @example
 * ```tsx
 * const { isOpen, tabs, searchResults, search, close } = useNavigator();
 * ```
 */
export function useNavigator()
{
	const {state} = useModule(ModuleId.Navigator);
	const actions = useActions(ModuleId.Navigator);

	return {
		isOpen: () => state().isOpen,
		tabs: () => state().topLevelContexts,
		searchResults: () => state().searchResults,
		currentSearchCode: () => state().currentSearchCode,
		...actions,
	};
}
