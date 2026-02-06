import type {IModuleDefinition} from './types';

/**
 * Helper to define a module with type inference
 */
export function defineModule<
	TState extends object,
	TManagers extends object = object,
	TActions extends object = object
>(
	definition: IModuleDefinition<TState, TManagers, TActions>
): IModuleDefinition<TState, TManagers, TActions>
{
	return definition;
}
