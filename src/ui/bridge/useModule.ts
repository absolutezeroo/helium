import {createStore, reconcile} from 'solid-js/store';
import {onMount, onCleanup} from 'solid-js';
import {useModuleRegistry} from './ModuleProvider';
import type {RegisteredModuleId, ModuleStateMap, ModuleActionsMap, ModuleAPI} from '@/modules/core';

/**
 * Main hook to consume a module in the UI
 *
 * @param moduleId ID of the module to use
 * @returns { state, actions } with reactive SolidJS state
 *
 * @example
 * ```tsx
 * import { useModule, ModuleId } from '@ui/bridge';
 *
 * function Navigator() {
 *   const { state, actions } = useModule(ModuleId.Navigator);
 *
 *   return (
 *     <Show when={state.isOpen}>
 *       <button onClick={actions.close}>Close</button>
 *       <For each={state.topLevelContexts}>
 *         {(ctx) => <Tab code={ctx.searchCode} />}
 *       </For>
 *     </Show>
 *   );
 * }
 * ```
 */
export function useModule<K extends RegisteredModuleId>(moduleId: K): ModuleAPI<K>
{
	const registry = useModuleRegistry();
	const module = registry.get(moduleId);

	// Create a SolidJS store from the module state
	// This is WHERE reactivity is created, on the UI side only
	const [state, setState] = createStore<ModuleStateMap[K]>(
		module.getState() as ModuleStateMap[K]
	);

	onMount(() =>
	{
		// Subscribe to Engine module changes
		const unsubscribe = registry.subscribe(moduleId, (newState) =>
		{
			// reconcile does smart diffing to minimize updates
			setState(reconcile(newState as ModuleStateMap[K]));
		});

		onCleanup(unsubscribe);
	});

	return {
		state,
		actions: module.actions as ModuleActionsMap[K],
	};
}
