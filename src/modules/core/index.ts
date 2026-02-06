/**
 * Module System Core
 *
 * Provides the infrastructure for the module architecture:
 * - MessageBus: Central message dispatch with middleware support
 * - ModuleRegistry: Manages module lifecycle and state
 * - defineModule: Type-safe module definition helper
 *
 * @example
 * ```typescript
 * import { MessageBus, ModuleRegistry, defineModule, ModuleId } from '@/modules/core';
 *
 * // Create infrastructure
 * const messageBus = new MessageBus();
 * const registry = new ModuleRegistry(context, messageBus);
 *
 * // Register modules
 * await registry.register(sessionModule);
 * await registry.register(navigatorModule);
 *
 * // Access module
 * const nav = registry.get(ModuleId.Navigator);
 * nav.actions.open();
 * ```
 *
 * @module modules/core
 */

export {MessageBus} from './MessageBus';
export {ModuleRegistry} from './ModuleRegistry';
export {defineModule} from './defineModule';
export {ModuleId} from './moduleIds';

export type {
	IModuleDefinition,
	ILoadedModule,
	IActionContext,
	IModuleContext,
	MessageHandlers,
	IHandlerContext,
	StateListener,
	IDependencyAccessor,
	ManagerIIDMap,
} from './types';

export type {
	ModuleId as ModuleIdType, // cast: type assertion required
	IModuleStateMap,
	IModuleActionsMap,
	IModuleAPI,
	RegisteredModuleId,
} from './moduleIds';

export type {Middleware, IMiddlewareContext} from './middleware/types';

export {
	loggingMiddleware,
	timingMiddleware,
	createFilteredLoggingMiddleware,
} from './middleware/loggingMiddleware';
