import type {ModuleDefinition} from './types';

/**
 * Helper to define a module with type inference
 */
export function defineModule<
	TState extends object,
	TManagers extends object = object,
	TActions extends object = object
>(
	definition: ModuleDefinition<TState, TManagers, TActions>
): ModuleDefinition<TState, TManagers, TActions>
{
	return definition;
}
