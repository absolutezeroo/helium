import type {ParentComponent} from 'solid-js';
import {createContext, onCleanup, useContext} from 'solid-js';
import type {ModuleRegistry} from '@/modules/core';

const ModuleRegistryContext = createContext<ModuleRegistry>();

interface IModuleProviderProps
{
	registry: ModuleRegistry;
}

/**
 * Provider to inject ModuleRegistry into the component tree
 *
 * @example
 * ```tsx
 * import { ModuleProvider } from '@ui/bridge';
 *
 * function App() {
 *   return (
 *     <ModuleProvider registry={registry}>
 *       <Navigator />
 *       <Inventory />
 *     </ModuleProvider>
 *   );
 * }
 * ```
 */
export const ModuleProvider: ParentComponent<IModuleProviderProps> = (props) =>
{
	onCleanup(() =>
	{
		// Registry will be disposed by Helium, not here
	});

	return (
		<ModuleRegistryContext.Provider value={props.registry}>
			{props.children}
		</ModuleRegistryContext.Provider>
	);
};

/**
 * Hook to access the ModuleRegistry
 * @throws If used outside a ModuleProvider
 */
export function useModuleRegistry(): ModuleRegistry
{
	const registry = useContext(ModuleRegistryContext);

	if (!registry)
	{
		throw new Error(
			'[useModuleRegistry] Must be used within a ModuleProvider. ' +
			'Wrap your app with <ModuleProvider registry={...}>.'
		);
	}

	return registry;
}
