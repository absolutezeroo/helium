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
	IModuleDefinition,
	ILoadedModule,
	IActionContext,
	IModuleContext,
	MessageHandlers,
	IHandlerContext,
	StateListener,
	IDependencyAccessor,
	ManagerIIDMap,
	ModuleIdType,
	IModuleStateMap,
	IModuleActionsMap,
	IModuleAPI,
	Middleware,
	IMiddlewareContext,
	RegisteredModuleId,
} from './core';

// Modules
export {sessionModule} from './session';
export type {ISessionState, SessionActions, IUserData, IAvailabilityStatus} from './session';

export {navigatorModule} from './navigator';
export type {INavigatorState, NavigatorActions, INavigatorManagers} from './navigator';

export {connectionModule} from './connection';
export type {IConnectionState, ConnectionStateType, LoadingStep, ConnectionActions} from './connection';

export {roomModule, RoomUserType} from './room';
export type {IRoomState, RoomActions, IRoomUserData, RoomSessionState, RoomUserTypeValue} from './room';

export {favouritesModule} from './favourites';
export type {IFavouritesState, FavouritesActions} from './favourites';

export {configModule} from './config';
export type {IConfigState, ConfigActions, IConfigManagers} from './config';

export {localizationModule} from './localization';
export type {ILocalizationState, LocalizationActions, ILocalizationManagers} from './localization';

export {inventoryModule} from './inventory';
export type {IInventoryState, InventoryActions, IInventoryManagers} from './inventory';
