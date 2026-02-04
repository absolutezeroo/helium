/**
 * Available module IDs
 * Use these constants instead of raw strings
 */
export const ModuleId = {
	Session: 'session',
	Navigator: 'navigator',
	Inventory: 'inventory',
	Room: 'room',
	Favourites: 'favourites',
	Connection: 'connection',
	Config: 'config',
	Localization: 'localization',
} as const;

export type ModuleIdType = (typeof ModuleId)[keyof typeof ModuleId];

// Re-export for backwards compatibility
export type ModuleId = ModuleIdType;

/**
 * Mapping Module ID -> State type
 * Extended by each module via declaration merging
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ModuleStateMap
{
	// Extended by each module via declaration merging
	// Example: 'session': SessionState;
}

/**
 * Mapping Module ID -> Actions type
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ModuleActionsMap
{
	// Extended by each module via declaration merging
	// Example: 'session': SessionActions;
}

/**
 * Valid module keys that have been registered via declaration merging
 */
export type RegisteredModuleId = keyof ModuleStateMap & keyof ModuleActionsMap;

/**
 * Type helper for useModule
 * Note: state is a getter function to preserve Map/class instances
 */
export interface ModuleAPI<K extends RegisteredModuleId>
{
	state: () => Readonly<ModuleStateMap[K]>;
	actions: ModuleActionsMap[K];
}
