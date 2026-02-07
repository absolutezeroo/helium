import {ModuleId, useActions, useModule} from '@ui/bridge';

/**
 * Convenience hook for Inventory module.
 *
 * @example
 * ```tsx
 * const { isOpen, furniGroups, toggle } = useInventory();
 * ```
 */
export function useInventory()
{
	const {state} = useModule(ModuleId.Inventory);
	const actions = useActions(ModuleId.Inventory);

	return {
		isOpen: () => state().isOpen,
		isLoading: () => state().isLoading,
		currentCategory: () => state().currentCategory,
		furniGroups: () => state().furniGroups,
		selectedFurniGroup: () => state().selectedFurniGroup,
		badges: () => state().badges,
		activeBadges: () => state().activeBadges,
		selectedBadge: () => state().selectedBadge,
		...actions,
	};
}
