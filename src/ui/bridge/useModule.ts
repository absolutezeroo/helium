import {createSignal, onCleanup, onMount} from 'solid-js';
import {useModuleRegistry} from './ModuleProvider';
import type {ModuleActionsMap, ModuleAPI, ModuleStateMap, RegisteredModuleId} from '@/modules/core';

/**
 * Main hook to consume a module in the UI
 *
 * Uses createSignal instead of createStore to preserve Map/class instances.
 * The signal holds a reference to the state object - when the module updates,
 * we get a new state object and the signal triggers a re-render.
 *
 * @param moduleId ID of the module to use
 * @returns { state, actions } with reactive state getter
 *
 * @example
 * ```tsx
 * import { useModule, ModuleId } from '@ui/bridge';
 *
 * function Navigator() {
 *   const { state, actions } = useModule(ModuleId.Navigator);
 *
 *   return (
 *     <Show when={state().isOpen}>
 *       <button onClick={actions.close}>Close</button>
 *       <For each={state().topLevelContexts}>
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

	const [state, setState] = createSignal<Readonly<ModuleStateMap[K]>>(
		module.getState() as ModuleStateMap[K]
	);

	onMount(() =>
	{
		const unsubscribe = registry.subscribe(moduleId, (newState) =>
		{
			// Use function form to avoid type issues with Solid's setter overloads
			setState(() => newState as ModuleStateMap[K]);
		});

		onCleanup(unsubscribe);
	});

	return {
		state,
		actions: module.actions as ModuleActionsMap[K],
	};
}
