import type {IID} from '@core/runtime';
import type {ModuleActionsMap, ModuleStateMap, RegisteredModuleId} from './moduleIds';
import type {MessageBus} from './MessageBus';

/**
 * Module definition (static configuration)
 */
export interface ModuleDefinition<
	TState extends object = object,
	TManagers extends object = object,
	TActions extends object = object
>
{
	/** Unique module identifier */
	id: string;

	/** IDs of modules this one depends on */
	depends?: string[];

	/** IIDs of managers required by this module */
	managerIIDs: ManagerIIDMap<TManagers>;

	/** Initial state (plain object, NOT reactive) */
	initialState: TState;

	/** Message handlers: eventName -> partial state */
	handlers: MessageHandlers<TState, TManagers>;

	/** Factory to create actions */
	actions: (ctx: ActionContext<TState, TManagers>) => TActions;

	/** Callback called after module initialization */
	onInit?: (ctx: ModuleContext<TState, TManagers>) => void;

	/** Callback called when module is disposed */
	onDispose?: () => void;
}

/**
 * Mapping of manager names to their IIDs
 */
export type ManagerIIDMap<TManagers> = {
	[K in keyof TManagers]: IID<TManagers[K]>;
};

/**
 * Context passed to actions
 */
export interface ActionContext<TState, TManagers>
{
	/** Returns a readonly copy of the current state */
	getState: () => Readonly<TState>;

	/** Updates the state (partial update) */
	updateState: (partial: Partial<TState>) => void;

	/** References to managers (resolved via IID) */
	managers: TManagers;

	/** Access to other modules (if declared in depends) */
	modules: DependencyAccessor;
}

/**
 * Extended context for onInit
 */
export interface ModuleContext<TState, TManagers> extends ActionContext<TState, TManagers>
{
	id: string;

	/** MessageBus for subscribing to events with manager access */
	messageBus: MessageBus;
}

/**
 * Accessor for dependent modules
 */
export interface DependencyAccessor
{
	get<K extends RegisteredModuleId>(id: K): {
		getState: () => Readonly<ModuleStateMap[K]>;
		actions: ModuleActionsMap[K];
	};
}

/**
 * Message handlers
 * Key = Event class name (e.g., "NavigatorSearchResultSetMessageEvent")
 * Value = function that receives parser, state, and managers context
 */
export type MessageHandlers<TState, TManagers = object> = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[eventName: string]: (
		parser: any,
		state: Readonly<TState>,
		ctx: HandlerContext<TState, TManagers>
	) => Partial<TState> | void;
};

/**
 * Context passed to message handlers
 */
export interface HandlerContext<TState, TManagers>
{
	/** References to managers (resolved via IID) */
	managers: TManagers;

	/** Update state directly (for complex updates) */
	updateState: (partial: Partial<TState>) => void;
}

/**
 * Loaded module (runtime instance)
 */
export interface LoadedModule<
	TState extends object = object,
	TActions extends object = object
>
{
	id: string;
	getState: () => Readonly<TState>;
	actions: TActions;
}

/**
 * Listener for state changes
 */
export type StateListener<TState = object> = (state: TState) => void;
