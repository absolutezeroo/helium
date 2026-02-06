import type {IContext, IID} from '@core/runtime';
import type {ActionContext, DependencyAccessor, LoadedModule, ModuleDefinition, StateListener} from './types';
import type {ModuleActionsMap, ModuleStateMap, RegisteredModuleId} from './moduleIds';
import type {MessageBus} from './MessageBus';
import {Logger} from '@core/utils/Logger';

/**
 * Central registry for all modules
 * Manages lifecycle, dependencies, and subscriptions
 */
export class ModuleRegistry
{
	private modules = new Map<string, LoadedModule>();
	private definitions = new Map<string, ModuleDefinition>();
	private states = new Map<string, object>();
	private subscribers = new Map<string, Set<StateListener>>();
	private handlerCleanups = new Map<string, Array<() => void>>();

	constructor(
		private context: IContext,
		private messageBus: MessageBus
	)
	{
	}

	/**
	 * Register a module
	 * Resolves dependencies via IID, creates state, and registers handlers
	 */
	register<S extends object, M extends object, A extends object>(
		definition: ModuleDefinition<S, M, A>
	): Promise<void>
	{
		return new Promise((resolve) =>
		{
			const {id, depends = [], managerIIDs, initialState, handlers, actions} = definition;

			// Verify that module dependencies are registered
			for (const depId of depends)
			{
				if (!this.modules.has(depId))
				{
					throw new Error(
						`[ModuleRegistry] Module "${id}" depends on "${depId}" which is not registered. ` +
						`Register "${depId}" first.`
					);
				}
			}

			// 1. Create initial state
			let state: S = {...initialState};

			this.states.set(id, state);
			this.definitions.set(id, definition as unknown as ModuleDefinition);

			// 2. Resolve managers via IID (async)
			const managerKeys = Object.keys(managerIIDs) as (keyof M)[];
			const managers = {} as M;

			let pendingManagers = managerKeys.length;

			if (pendingManagers === 0)
			{
				// No managers, can initialize directly
				this.finishRegistration(id, definition, state, managers, actions, handlers, resolve);

				return;
			}

			for (const key of managerKeys)
			{
				const iid = managerIIDs[key] as IID<M[typeof key]>;

				this.context.queueInterface(iid, (_, instance) =>
				{
					managers[key] = instance;
					pendingManagers--;

					if (pendingManagers === 0)
					{
						this.finishRegistration(id, definition, state, managers, actions, handlers, resolve);
					}
				});
			}
		});
	}

	/**
	 * Get a module by its ID
	 */
	get<K extends RegisteredModuleId>(id: K): LoadedModule<ModuleStateMap[K], ModuleActionsMap[K]>
	{
		const module = this.modules.get(id);

		if (!module)
		{
			throw new Error(`[ModuleRegistry] Module "${id}" not registered`);
		}

		return module as LoadedModule<ModuleStateMap[K], ModuleActionsMap[K]>;
	}

	/**
	 * Check if a module is registered
	 */
	has(id: string): boolean
	{
		return this.modules.has(id);
	}

	/**
	 * Subscribe to state changes of a module
	 * @returns Unsubscribe function
	 */
	subscribe<K extends RegisteredModuleId>(
		id: K,
		listener: StateListener<ModuleStateMap[K]>
	): () => void
	{
		if (!this.subscribers.has(id))
		{
			this.subscribers.set(id, new Set());
		}

		this.subscribers.get(id)!.add(listener as StateListener);

		return () =>
		{
			this.subscribers.get(id)?.delete(listener as StateListener);
		};
	}

	/**
	 * Unregister a module
	 */
	unregister(id: string): void
	{
		// Call onDispose
		const definition = this.definitions.get(id);

		definition?.onDispose?.();

		// Cleanup handlers
		const cleanups = this.handlerCleanups.get(id);

		cleanups?.forEach(cleanup => cleanup());

		// Remove everything
		this.modules.delete(id);
		this.definitions.delete(id);
		this.states.delete(id);
		this.subscribers.delete(id);
		this.handlerCleanups.delete(id);
	}

	/**
	 * Unregister all modules
	 */
	dispose(): void
	{
		const ids = Array.from(this.modules.keys());

		// Unregister in reverse order (dependencies first)
		ids.reverse().forEach(id => this.unregister(id));
	}

	/**
	 * List all registered modules
	 */
	listModules(): string[]
	{
		return Array.from(this.modules.keys());
	}

	private finishRegistration<S extends object, M extends object, A extends object>(
		id: string,
		definition: ModuleDefinition<S, M, A>,
		initialState: S,
		managers: M,
		actionsFactory: ModuleDefinition<S, M, A>['actions'],
		handlers: ModuleDefinition<S, M, A>['handlers'],
		resolve: () => void
	): void
	{
		const {depends = []} = definition;

		// Mutable internal state
		let state = initialState;

		// Create accessor for dependencies
		const dependencyAccessor: DependencyAccessor = {
			get: <K extends RegisteredModuleId>(depId: K) =>
			{
				if (!depends.includes(depId))
				{
					throw new Error(
						`[ModuleRegistry] Module "${id}" tried to access "${depId}" but it's not declared in depends`
					);
				}

				// eslint-disable-next-line @typescript-eslint/no-explicit-any -- generic module registry lookup
				return this.modules.get(depId) as any;
			},
		};

		// Function to update state
		// Note: notify is deferred to avoid stack overflow during message processing
		let pendingNotify = false;

		const updateState = (partial: Partial<S>) =>
		{
			state = {...state, ...partial};
			this.states.set(id, state);

			// Batch multiple updates into a single notification
			if (!pendingNotify)
			{
				pendingNotify = true;
				queueMicrotask(() =>
				{
					pendingNotify = false;
					this.notify(id, state);
				});
			}
		};

		// Create context for actions
		const actionContext: ActionContext<S, M> = {
			getState: () => ({...state}) as Readonly<S>,
			updateState,
			managers,
			modules: dependencyAccessor,
		};

		// Instantiate actions
		const boundActions = actionsFactory(actionContext);

		// Create handler context
		const handlerContext = {
			managers,
			updateState,
		};

		// Register handlers on MessageBus
		const cleanups: Array<() => void> = [];

		for (const [eventName, handler] of Object.entries(handlers))
		{
			const cleanup = this.messageBus.on(eventName, (parser) =>
			{
				const updates = handler(parser, state as Readonly<S>, handlerContext);

				if (updates && Object.keys(updates).length > 0)
				{
					updateState(updates as Partial<S>);
				}
			});

			cleanups.push(cleanup);
		}

		this.handlerCleanups.set(id, cleanups);

		// Store the module
		const loadedModule: LoadedModule<S, A> = {
			id,
			getState: () => ({...state}) as Readonly<S>,
			actions: boundActions,
		};

		this.modules.set(id, loadedModule as LoadedModule);

		// Call onInit if defined
		definition.onInit?.({
			...actionContext,
			id,
			messageBus: this.messageBus,
		});

		resolve();
	}

	/**
	 * Notify all subscribers of a state change
	 */
	private notify(id: string, state: object): void
	{
		const listeners = this.subscribers.get(id);

		if (!listeners) return;

		listeners.forEach(listener =>
		{
			try
			{
				listener(state);
			} catch (error)
			{
				Logger.getLogger('ModuleRegistry').error(`Subscriber error for "${id}":`, error);
			}
		});
	}
}
