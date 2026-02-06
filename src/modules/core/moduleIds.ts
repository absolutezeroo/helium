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
export interface IModuleStateMap
{
	// Extended by each module via declaration merging
	// Example: 'session': ISessionState;
}

/**
 * Mapping Module ID -> Actions type
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IModuleActionsMap
{
	// Extended by each module via declaration merging
	// Example: 'session': SessionActions;
}

/**
 * Valid module keys that have been registered via declaration merging
 */
export type RegisteredModuleId = keyof IModuleStateMap & keyof IModuleActionsMap;

/**
 * Type helper for useModule
 * Note: state is a getter function to preserve Map/class instances
 */
export interface IModuleAPI<K extends RegisteredModuleId>
{
	state: () => Readonly<IModuleStateMap[K]>;
	actions: IModuleActionsMap[K];
}
