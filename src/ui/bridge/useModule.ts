import {createSignal, onCleanup, onMount} from 'solid-js';
import type {IModuleActionsMap, IModuleAPI, IModuleStateMap, RegisteredModuleId} from '@/modules/core';
import {useModuleRegistry} from './ModuleProvider';

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
export function useModule<K extends RegisteredModuleId>(moduleId: K): IModuleAPI<K>
{
	const registry = useModuleRegistry();
	const module = registry.get(moduleId);

	// Use createSignal with equals: false to always trigger updates
	const [state, setState] = createSignal<Readonly<IModuleStateMap[K]>>(
		module.getState() as IModuleStateMap[K], // cast: type assertion required
		{equals: false}
	);

	onMount(() =>
	{
		const unsubscribe = registry.subscribe(moduleId, (newState) =>
		{
			// Use function form to avoid type issues with Solid's setter overloads
			setState(() => newState as IModuleStateMap[K]); // cast: type assertion required
		});

		onCleanup(unsubscribe);
	});

	return {
		state,
		actions: module.actions as IModuleActionsMap[K], // cast: type assertion required
	};
}
