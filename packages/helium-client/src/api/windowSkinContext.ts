/**
 * SolidJS context for the ElementRegistry.
 *
 * Provides the ElementRegistry to the window component tree so that
 * skin resolution can look up element descriptors.
 */

import { createContext, useContext } from 'solid-js';
import type { ElementRegistry } from '@habbo/window/ElementRegistry';

/**
 * Context carrying the ElementRegistry instance.
 */
export const WindowSkinContext = createContext<ElementRegistry>();

/**
 * Hook to access the ElementRegistry from the context.
 *
 * @returns The ElementRegistry instance
 * @throws If used outside of a WindowSkinContext.Provider
 */
export function useElementRegistry(): ElementRegistry
{
	const registry = useContext(WindowSkinContext);

	if(!registry)
	{
		throw new Error('[useElementRegistry] Must be used within a WindowSkinContext.Provider');
	}

	return registry;
}
