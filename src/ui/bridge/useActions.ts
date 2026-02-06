import type {IModuleActionsMap, RegisteredModuleId} from '@/modules/core';
import {useModuleRegistry} from './ModuleProvider';

/**
 * Hook to access only the actions of a module
 * Useful when you don't need the reactive state
 *
 * @example
 * ```tsx
 * import { useActions, ModuleId } from '@ui/bridge';
 *
 * function CloseButton() {
 *   const actions = useActions(ModuleId.Navigator);
 *   return <button onClick={actions.close}>Close</button>;
 * }
 * ```
 */
export function useActions<K extends RegisteredModuleId>(moduleId: K): IModuleActionsMap[K]
{
	const registry = useModuleRegistry();
	const module = registry.get(moduleId);

	return module.actions as IModuleActionsMap[K]; // cast: type assertion required
}
