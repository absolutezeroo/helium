/**
 * Helium Module System
 *
 * Self-contained modules that bridge Engine (vanilla TypeScript) and UI (SolidJS).
 *
 * @example
 * ```typescript
 * // In Helium.ts
 * import { MessageBus, ModuleRegistry } from '@/modules/core';
 * import { sessionModule, navigatorModule } from '@/modules';
 *
 * const messageBus = new MessageBus();
 * const registry = new ModuleRegistry(context, messageBus);
 *
 * await registry.register(sessionModule);
 * await registry.register(navigatorModule);
 * ```
 *
 * @module modules
 */

// Core infrastructure
export {
	MessageBus,
	ModuleRegistry,
	defineModule,
	ModuleId,
	loggingMiddleware,
	timingMiddleware,
	createFilteredLoggingMiddleware,
} from './core';

export type {
	ModuleDefinition,
	LoadedModule,
	ActionContext,
	ModuleContext,
	MessageHandlers,
	HandlerContext,
	StateListener,
	DependencyAccessor,
	ManagerIIDMap,
	ModuleIdType,
	ModuleStateMap,
	ModuleActionsMap,
	ModuleAPI,
	Middleware,
	MiddlewareContext,
	RegisteredModuleId,
} from './core';

// Modules
export {sessionModule} from './session';
export type {SessionState, SessionActions, UserData, AvailabilityStatus} from './session';

export {navigatorModule} from './navigator';
export type {NavigatorState, NavigatorActions, NavigatorManagers} from './navigator';

export {connectionModule} from './connection';
export type {ConnectionState, ConnectionStateType, LoadingStep, ConnectionActions} from './connection';

export {roomModule, RoomUserType} from './room';
export type {RoomState, RoomActions, RoomUserData, RoomSessionState, RoomUserTypeValue} from './room';

export {favouritesModule} from './favourites';
export type {FavouritesState, FavouritesActions} from './favourites';

export {configModule} from './config';
export type {ConfigState, ConfigActions, ConfigManagers} from './config';

export {localizationModule} from './localization';
export type {LocalizationState, LocalizationActions, LocalizationManagers} from './localization';

export {inventoryModule} from './inventory';
export type {InventoryState, InventoryActions, InventoryManagers} from './inventory';
