import {createMemo} from 'solid-js';
import type {Accessor} from 'solid-js';
import {useModule} from './useModule';
import type {RegisteredModuleId, ModuleStateMap} from '@/modules/core';

/**
 * Hook to select a part of the module state
 * Optimizes re-renders by only recalculating if the selected value changes
 *
 * @param moduleId Module ID
 * @param selector Function that extracts the desired value from state
 * @returns Reactive accessor to the selected value
 *
 * @example
 * ```tsx
 * import { useSelector, ModuleId } from '@ui/bridge';
 *
 * function RoomCount() {
 *   // Only re-renders if count changes, not if other parts of state change
 *   const roomCount = useSelector(ModuleId.Navigator, (s) =>
 *     s.searchResults?.blocks.flatMap(b => b.guestRooms).length ?? 0
 *   );
 *
 *   return <span>{roomCount()} rooms</span>;
 * }
 * ```
 */
export function useSelector<K extends RegisteredModuleId, T>(
	moduleId: K,
	selector: (state: ModuleStateMap[K]) => T
): Accessor<T>
{
	const {state} = useModule(moduleId);

	// createMemo only recalculates if the selector result changes
	return createMemo(() => selector(state));
}

/**
 * Hook to select multiple values from state
 *
 * @example
 * ```tsx
 * const { isOpen, currentTab } = useSelectors(ModuleId.Navigator, {
 *   isOpen: s => s.isOpen,
 *   currentTab: s => s.currentSearchCode,
 * });
 *
 * // Usage: isOpen(), currentTab()
 * ```
 */
export function useSelectors<K extends RegisteredModuleId, T extends Record<string, (state: ModuleStateMap[K]) => unknown>>(
	moduleId: K,
	selectors: T
): {[P in keyof T]: Accessor<ReturnType<T[P]>>}
{
	const {state} = useModule(moduleId);

	const result = {} as {[P in keyof T]: Accessor<ReturnType<T[P]>>};

	for (const key in selectors)
	{
		result[key] = createMemo(() => selectors[key](state)) as Accessor<ReturnType<T[typeof key]>>;
	}

	return result;
}
