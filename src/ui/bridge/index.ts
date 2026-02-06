/**
 * UI Bridge
 *
 * Connects the module system (Engine) to SolidJS (UI).
 * Creates reactivity only on the UI side.
 *
 * @example
 * ```tsx
 * import { ModuleProvider, useModule, useSelector, useActions, ModuleId } from '@ui/bridge';
 *
 * // In root component
 * <ModuleProvider registry={registry}>
 *   <App />
 * </ModuleProvider>
 *
 * // In any component
 * const { state, actions } = useModule(ModuleId.Navigator);
 * const roomCount = useSelector(ModuleId.Navigator, s => s.searchResults?.length ?? 0);
 * const navActions = useActions(ModuleId.Navigator);
 * ```
 *
 * @module ui/bridge
 */

// Core exports
export {ModuleProvider, useModuleRegistry} from './ModuleProvider';
export {useModule} from './useModule';
export {useSelector, useSelectors} from './useSelector';
export {useActions} from './useActions';

// Re-export ModuleId for convenience
export {ModuleId} from '@/modules/core';
export type {IModuleStateMap, IModuleActionsMap, IModuleAPI} from '@/modules/core';
