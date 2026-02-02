# Architecture Modules - Helium

> Document de référence pour le système de modules.

## Vue d'ensemble

Cette architecture s'intègre avec le système `Component`/`ComponentContext` existant.

```
ENGINE (vanilla TypeScript)              UI (SolidJS)
├── core/                                └── ui/
│   └── runtime/                             ├── bridge/      (useModule, selectors)
│       ├── Component.ts                     ├── components/
│       ├── ComponentContext.ts              └── ...
│       └── IID.ts
│
├── habbo/         (managers = Components)
├── room/
│
└── modules/       (nouveau)
    ├── core/      (MessageBus, Registry)
    ├── navigator/
    ├── inventory/
    └── ...
```

### Principes

1. **Engine = pur TypeScript** - Aucune dépendance à SolidJS
2. **UI = consommateur** - Crée la réactivité via `useModule()`
3. **Modules = pont** - Déclarent state, handlers, actions
4. **MessageBus = central** - Tous les messages serveur passent par là
5. **ComponentContext = IoC** - Résolution des managers via `IID`

---

## Flux de données

```
┌─────────────┐
│   Server    │
└──────┬──────┘
       │ WebSocket messages
       ▼
┌─────────────────────────────────────────────────────────────┐
│                  HabboCommunicationManager                   │
│                           │                                  │
│                           ▼                                  │
│                      MessageBus                              │
│  ┌─────────────┐                                            │
│  │ Middlewares │ → logging, debugging, interceptors         │
│  └─────────────┘                                            │
└──────────────────────────┬──────────────────────────────────┘
                           │ dispatch to handlers
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
     ┌───────────┐   ┌───────────┐   ┌───────────┐
     │  Module   │   │  Module   │   │  Module   │
     │ "session" │   │"navigator"│   │"inventory"│
     │           │   │           │   │           │
     │  state    │   │  state    │   │  state    │    ← Plain objects
     │  handlers │   │  handlers │   │  handlers │
     │  actions  │   │  actions  │   │  actions  │
     │  managers │   │  managers │   │  managers │    ← Via IID
     └─────┬─────┘   └─────┬─────┘   └─────┬─────┘
           │               │               │
           └───────────────┼───────────────┘
                           │ subscribe (state changes)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      UI Layer (SolidJS)                      │
│                                                              │
│   useModule('navigator') → { state, actions }               │
│                              ↓                              │
│                        createStore()  ← Réactivité créée ici │
│                              ↓                              │
│                        Components                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Structure des dossiers

```
src/
├── core/
│   ├── runtime/
│   │   ├── Component.ts
│   │   ├── ComponentContext.ts
│   │   ├── IID.ts
│   │   └── ...
│   └── communication/
│       └── ...
│
├── habbo/
│   ├── navigator/
│   │   ├── IHabboNavigator.ts
│   │   ├── HabboNavigator.ts
│   │   └── ...
│   ├── inventory/
│   └── ...
│
├── modules/
│   ├── core/
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── moduleIds.ts
│   │   ├── defineModule.ts
│   │   ├── MessageBus.ts
│   │   ├── ModuleRegistry.ts
│   │   └── middleware/
│   │       ├── types.ts
│   │       └── loggingMiddleware.ts
│   │
│   ├── session/
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── handlers.ts
│   │   └── actions.ts
│   │
│   ├── navigator/
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── handlers.ts
│   │   └── actions.ts
│   │
│   └── index.ts              # Exporte tous les modules
│
├── iid/                       # Interface Identifiers
│   ├── IIDHabboNavigator.ts
│   └── ...
│
└── ui/
    ├── bridge/
    │   ├── index.ts
    │   ├── ModuleProvider.tsx
    │   ├── useModule.ts
    │   └── useSelector.ts
    │
    ├── components/
    └── ...
```

---

## Code Engine - Module Core

### `src/modules/core/types.ts`

```typescript
import type { IContext } from '@core/runtime';
import type { IID } from '@core/runtime';

/**
 * Définition d'un module (configuration statique)
 */
export interface ModuleDefinition<
  TState extends object = object,
  TManagers extends object = object,
  TActions extends object = object
> {
  /** Identifiant unique du module */
  id: string;

  /** IDs des modules dont celui-ci dépend */
  depends?: string[];

  /** IIDs des managers requis pour ce module */
  managerIIDs: ManagerIIDMap<TManagers>;

  /** State initial (plain object, PAS réactif) */
  initialState: TState;

  /** Handlers de messages: eventName → partial state */
  handlers: MessageHandlers<TState>;

  /** Factory pour créer les actions */
  actions: (ctx: ActionContext<TState, TManagers>) => TActions;

  /** Callback appelé après l'initialisation du module */
  onInit?: (ctx: ModuleContext<TState, TManagers>) => void;

  /** Callback appelé lors de la destruction du module */
  onDispose?: () => void;
}

/**
 * Mapping des noms de managers vers leurs IIDs
 */
export type ManagerIIDMap<TManagers> = {
  [K in keyof TManagers]: IID<TManagers[K]>;
};

/**
 * Contexte passé aux actions
 */
export interface ActionContext<TState, TManagers> {
  /** Retourne une copie readonly du state actuel */
  getState: () => Readonly<TState>;

  /** Met à jour le state (partial update) */
  updateState: (partial: Partial<TState>) => void;

  /** Références aux managers (résolus via IID) */
  managers: TManagers;

  /** Accès aux autres modules (si déclarés dans depends) */
  modules: DependencyAccessor;
}

/**
 * Contexte étendu pour onInit
 */
export interface ModuleContext<TState, TManagers> extends ActionContext<TState, TManagers> {
  id: string;
}

/**
 * Accessor pour les modules dépendants
 */
export interface DependencyAccessor {
  get<K extends ModuleId>(id: K): {
    getState: () => Readonly<ModuleStateMap[K]>;
    actions: ModuleActionsMap[K];
  };
}

/**
 * Handlers de messages
 * Clé = nom de la classe Event (ex: "NavigatorSearchResultSetMessageEvent")
 * Valeur = fonction qui reçoit le parser et retourne un partial state
 */
export type MessageHandlers<TState> = {
  [eventName: string]: (parser: any, state: Readonly<TState>) => Partial<TState> | void;
};

/**
 * Module chargé (instance runtime)
 */
export interface LoadedModule<
  TState extends object = object,
  TActions extends object = object
> {
  id: string;
  getState: () => Readonly<TState>;
  actions: TActions;
}

/**
 * Listener pour les changements de state
 */
export type StateListener<TState = object> = (state: TState) => void;
```

### `src/modules/core/moduleIds.ts`

```typescript
/**
 * IDs des modules disponibles
 * Utiliser ces constantes plutôt que des strings
 */
export const ModuleId = {
  Session: 'session',
  Navigator: 'navigator',
  Inventory: 'inventory',
  Room: 'room',
  Favourites: 'favourites',
  Connection: 'connection',
} as const;

export type ModuleId = typeof ModuleId[keyof typeof ModuleId];

/**
 * Mapping Module ID → State type
 * À étendre quand on ajoute des modules
 */
export interface ModuleStateMap {
  'session': import('../session/types').SessionState;
  'navigator': import('../navigator/types').NavigatorState;
  // ... autres modules
}

/**
 * Mapping Module ID → Actions type
 */
export interface ModuleActionsMap {
  'session': import('../session/actions').SessionActions;
  'navigator': import('../navigator/actions').NavigatorActions;
  // ... autres modules
}

/**
 * Type helper pour useModule
 */
export interface ModuleAPI<K extends ModuleId> {
  state: ModuleStateMap[K];
  actions: ModuleActionsMap[K];
}
```

### `src/modules/core/defineModule.ts`

```typescript
import type { ModuleDefinition } from './types';

/**
 * Helper pour définir un module avec inférence de types
 */
export function defineModule<
  TState extends object,
  TManagers extends object = object,
  TActions extends object = object
>(
  definition: ModuleDefinition<TState, TManagers, TActions>
): ModuleDefinition<TState, TManagers, TActions> {
  return definition;
}
```

### `src/modules/core/MessageBus.ts`

```typescript
import type { IMessageEvent } from '@core/communication/messages/IMessageEvent';
import type { Middleware, MiddlewareContext } from './middleware/types';

/**
 * Bus central pour les messages serveur
 * Tous les messages passent par ici et sont dispatchés aux handlers enregistrés
 */
export class MessageBus {
  private handlers = new Map<string, Set<(parser: any) => void>>();
  private middlewares: Middleware[] = [];

  /**
   * Ajoute un middleware à la chaîne
   */
  use(middleware: Middleware): this {
    this.middlewares.push(middleware);
    return this;
  }

  /**
   * Enregistre un handler pour un type de message
   * @param eventName Nom de la classe Event (ex: "NavigatorSearchResultSetMessageEvent")
   * @param handler Fonction appelée avec le parser
   * @returns Fonction pour se désinscrire
   */
  on(eventName: string, handler: (parser: any) => void): () => void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, new Set());
    }
    this.handlers.get(eventName)!.add(handler);

    return () => this.off(eventName, handler);
  }

  /**
   * Supprime un handler
   */
  off(eventName: string, handler: (parser: any) => void): void {
    this.handlers.get(eventName)?.delete(handler);
  }

  /**
   * Dispatch un message à tous les handlers enregistrés
   * Les middlewares sont exécutés en premier
   */
  dispatch(event: IMessageEvent): void {
    const parser = event.parser;
    if (!parser) return;

    const eventName = event.constructor.name;

    const context: MiddlewareContext = {
      eventName,
      event,
      parser,
      timestamp: Date.now(),
    };

    // Exécute les middlewares puis les handlers
    this.executeMiddlewareChain(context, 0, () => {
      this.executeHandlers(eventName, parser);
    });
  }

  private executeMiddlewareChain(
    context: MiddlewareContext,
    index: number,
    done: () => void
  ): void {
    if (index >= this.middlewares.length) {
      done();
      return;
    }

    const middleware = this.middlewares[index];

    try {
      middleware(context, () => {
        this.executeMiddlewareChain(context, index + 1, done);
      });
    } catch (error) {
      console.error(`[MessageBus] Middleware error:`, error);
      this.executeMiddlewareChain(context, index + 1, done);
    }
  }

  private executeHandlers(eventName: string, parser: any): void {
    const handlers = this.handlers.get(eventName);
    if (!handlers || handlers.size === 0) return;

    handlers.forEach(handler => {
      try {
        handler(parser);
      } catch (error) {
        console.error(`[MessageBus] Handler error for ${eventName}:`, error);
      }
    });
  }

  /**
   * Retourne le nombre de handlers enregistrés pour un event
   */
  handlerCount(eventName: string): number {
    return this.handlers.get(eventName)?.size ?? 0;
  }

  /**
   * Supprime tous les handlers
   */
  clear(): void {
    this.handlers.clear();
  }
}
```

### `src/modules/core/ModuleRegistry.ts`

```typescript
import type { IContext } from '@core/runtime';
import type { IID } from '@core/runtime';
import type {
  ModuleDefinition,
  LoadedModule,
  ActionContext,
  StateListener,
  DependencyAccessor,
} from './types';
import type { ModuleId, ModuleStateMap, ModuleActionsMap } from './moduleIds';
import type { MessageBus } from './MessageBus';

/**
 * Registry central pour tous les modules
 * Gère le lifecycle, les dépendances, et les subscriptions
 */
export class ModuleRegistry {
  private modules = new Map<string, LoadedModule>();
  private definitions = new Map<string, ModuleDefinition>();
  private states = new Map<string, object>();
  private subscribers = new Map<string, Set<StateListener>>();
  private handlerCleanups = new Map<string, Array<() => void>>();
  private pendingModules = new Map<string, { definition: ModuleDefinition; resolve: () => void }>();

  constructor(
    private context: IContext,
    private messageBus: MessageBus
  ) {}

  /**
   * Enregistre un module
   * Résout les dépendances via IID, crée le state, et enregistre les handlers
   */
  register<S extends object, M extends object, A extends object>(
    definition: ModuleDefinition<S, M, A>
  ): Promise<void> {
    return new Promise((resolve) => {
      const { id, depends = [], managerIIDs, initialState, handlers, actions } = definition;

      // Vérifie que les dépendances de modules sont enregistrées
      for (const depId of depends) {
        if (!this.modules.has(depId)) {
          throw new Error(
            `[ModuleRegistry] Module "${id}" depends on "${depId}" which is not registered. ` +
            `Register "${depId}" first.`
          );
        }
      }

      // 1. Crée le state initial
      let state: S = { ...initialState };
      this.states.set(id, state);
      this.definitions.set(id, definition);

      // 2. Résout les managers via IID (async)
      const managerKeys = Object.keys(managerIIDs) as (keyof M)[];
      const managers = {} as M;
      let pendingManagers = managerKeys.length;

      if (pendingManagers === 0) {
        // Pas de managers, on peut initialiser directement
        this.finishRegistration(id, definition, state, managers, actions, handlers, resolve);
        return;
      }

      for (const key of managerKeys) {
        const iid = managerIIDs[key] as IID<M[typeof key]>;

        this.context.queueInterface(iid, (_, instance) => {
          managers[key] = instance;
          pendingManagers--;

          if (pendingManagers === 0) {
            this.finishRegistration(id, definition, state, managers, actions, handlers, resolve);
          }
        });
      }
    });
  }

  private finishRegistration<S extends object, M extends object, A extends object>(
    id: string,
    definition: ModuleDefinition<S, M, A>,
    state: S,
    managers: M,
    actionsFactory: ModuleDefinition<S, M, A>['actions'],
    handlers: ModuleDefinition<S, M, A>['handlers'],
    resolve: () => void
  ): void {
    const { depends = [] } = definition;

    // Crée l'accessor pour les dépendances
    const dependencyAccessor: DependencyAccessor = {
      get: <K extends ModuleId>(depId: K) => {
        if (!depends.includes(depId)) {
          throw new Error(
            `[ModuleRegistry] Module "${id}" tried to access "${depId}" but it's not declared in depends`
          );
        }
        return this.modules.get(depId) as any;
      },
    };

    // Fonction pour mettre à jour le state
    const updateState = (partial: Partial<S>) => {
      state = { ...state, ...partial };
      this.states.set(id, state);
      this.notify(id, state);
    };

    // Crée le contexte pour les actions
    const actionContext: ActionContext<S, M> = {
      getState: () => ({ ...state }) as Readonly<S>,
      updateState,
      managers,
      modules: dependencyAccessor,
    };

    // Instancie les actions
    const boundActions = actionsFactory(actionContext);

    // Enregistre les handlers sur le MessageBus
    const cleanups: Array<() => void> = [];

    for (const [eventName, handler] of Object.entries(handlers)) {
      const cleanup = this.messageBus.on(eventName, (parser) => {
        const updates = handler(parser, state as Readonly<S>);
        if (updates && Object.keys(updates).length > 0) {
          updateState(updates as Partial<S>);
        }
      });
      cleanups.push(cleanup);
    }

    this.handlerCleanups.set(id, cleanups);

    // Stocke le module
    const loadedModule: LoadedModule<S, A> = {
      id,
      getState: () => ({ ...state }) as Readonly<S>,
      actions: boundActions,
    };

    this.modules.set(id, loadedModule);

    // Appelle onInit si défini
    definition.onInit?.({
      ...actionContext,
      id,
    });

    resolve();
  }

  /**
   * Récupère un module par son ID
   */
  get<K extends ModuleId>(id: K): LoadedModule<ModuleStateMap[K], ModuleActionsMap[K]> {
    const module = this.modules.get(id);
    if (!module) {
      throw new Error(`[ModuleRegistry] Module "${id}" not registered`);
    }
    return module as LoadedModule<ModuleStateMap[K], ModuleActionsMap[K]>;
  }

  /**
   * Vérifie si un module est enregistré
   */
  has(id: string): boolean {
    return this.modules.has(id);
  }

  /**
   * S'abonne aux changements de state d'un module
   * @returns Fonction pour se désabonner
   */
  subscribe<K extends ModuleId>(
    id: K,
    listener: StateListener<ModuleStateMap[K]>
  ): () => void {
    if (!this.subscribers.has(id)) {
      this.subscribers.set(id, new Set());
    }

    this.subscribers.get(id)!.add(listener as StateListener);

    return () => {
      this.subscribers.get(id)?.delete(listener as StateListener);
    };
  }

  /**
   * Notifie tous les subscribers d'un changement de state
   */
  private notify(id: string, state: object): void {
    const listeners = this.subscribers.get(id);
    if (!listeners) return;

    listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error(`[ModuleRegistry] Subscriber error for "${id}":`, error);
      }
    });
  }

  /**
   * Désenregistre un module
   */
  unregister(id: string): void {
    // Appelle onDispose
    const definition = this.definitions.get(id);
    definition?.onDispose?.();

    // Cleanup les handlers
    const cleanups = this.handlerCleanups.get(id);
    cleanups?.forEach(cleanup => cleanup());

    // Supprime tout
    this.modules.delete(id);
    this.definitions.delete(id);
    this.states.delete(id);
    this.subscribers.delete(id);
    this.handlerCleanups.delete(id);
  }

  /**
   * Désenregistre tous les modules
   */
  dispose(): void {
    const ids = Array.from(this.modules.keys());

    // Désenregistre dans l'ordre inverse (dépendances d'abord)
    ids.reverse().forEach(id => this.unregister(id));
  }

  /**
   * Liste tous les modules enregistrés
   */
  listModules(): string[] {
    return Array.from(this.modules.keys());
  }
}
```

### `src/modules/core/middleware/types.ts`

```typescript
import type { IMessageEvent } from '@core/communication/messages/IMessageEvent';

/**
 * Contexte passé aux middlewares
 */
export interface MiddlewareContext {
  /** Nom de la classe Event */
  eventName: string;
  /** L'event original */
  event: IMessageEvent;
  /** Le parser extrait */
  parser: any;
  /** Timestamp de réception */
  timestamp: number;
}

/**
 * Fonction middleware
 * Appeler next() pour continuer la chaîne
 * Ne pas appeler next() pour stopper la propagation
 */
export type Middleware = (
  context: MiddlewareContext,
  next: () => void
) => void;
```

### `src/modules/core/middleware/loggingMiddleware.ts`

```typescript
import type { Middleware } from './types';

/**
 * Middleware de logging pour le développement
 */
export const loggingMiddleware: Middleware = (context, next) => {
  console.log(
    `%c[Message] ${context.eventName}`,
    'color: #888; font-weight: bold;',
    context.parser
  );
  next();
};

/**
 * Middleware de logging filtré
 */
export function createFilteredLoggingMiddleware(pattern: RegExp): Middleware {
  return (context, next) => {
    if (pattern.test(context.eventName)) {
      console.log(
        `%c[Message] ${context.eventName}`,
        'color: #4CAF50; font-weight: bold;',
        context.parser
      );
    }
    next();
  };
}

/**
 * Middleware de timing
 */
export const timingMiddleware: Middleware = (context, next) => {
  const start = performance.now();
  next();
  const duration = performance.now() - start;

  if (duration > 5) {
    console.warn(`[Message] ${context.eventName} took ${duration.toFixed(2)}ms`);
  }
};
```

### `src/modules/core/index.ts`

```typescript
export { MessageBus } from './MessageBus';
export { ModuleRegistry } from './ModuleRegistry';
export { defineModule } from './defineModule';
export { ModuleId } from './moduleIds';

export type {
  ModuleDefinition,
  LoadedModule,
  ActionContext,
  ModuleContext,
  MessageHandlers,
  StateListener,
  DependencyAccessor,
  ManagerIIDMap,
} from './types';

export type {
  ModuleId as ModuleIdType,
  ModuleStateMap,
  ModuleActionsMap,
  ModuleAPI,
} from './moduleIds';

export type {
  Middleware,
  MiddlewareContext,
} from './middleware/types';

export {
  loggingMiddleware,
  timingMiddleware,
  createFilteredLoggingMiddleware,
} from './middleware/loggingMiddleware';
```

---

## Code Engine - Exemple Module Navigator

### `src/modules/navigator/types.ts`

```typescript
import type {
  NavigatorSearchResultSet,
  NavigatorTopLevelContext,
} from '@habbo/communication/messages/incoming/newnavigator';

export interface NavigatorState {
  isOpen: boolean;
  isRoomInfoOpen: boolean;
  isCreateModalOpen: boolean;
  currentSearchCode: string;
  topLevelContexts: NavigatorTopLevelContext[];
  searchResults: NavigatorSearchResultSet | null;
  homeRoomId: number;
  isLoading: boolean;
}
```

### `src/modules/navigator/handlers.ts`

```typescript
import type { MessageHandlers } from '../core/types';
import type { NavigatorState } from './types';

export const handlers: MessageHandlers<NavigatorState> = {

  NavigatorSearchResultSetMessageEvent: (parser): Partial<NavigatorState> => ({
    searchResults: parser.searchResult,
    isLoading: false,
  }),

  NavigatorMetaDataMessageEvent: (parser, state): Partial<NavigatorState> => {
    const contexts = [...parser.topLevelContexts];
    const updates: Partial<NavigatorState> = { topLevelContexts: contexts };

    if (contexts.length > 0 && !state.currentSearchCode) {
      updates.currentSearchCode = contexts[0].searchCode;
    }

    return updates;
  },

  NavigatorSettingsMessageEvent: (parser): Partial<NavigatorState> => ({
    homeRoomId: parser.homeRoomId,
  }),
};
```

### `src/modules/navigator/actions.ts`

```typescript
import type { ActionContext } from '../core/types';
import type { NavigatorState } from './types';
import type { IHabboNavigator, IHabboNewNavigator } from '@habbo/navigator';

type Managers = {
  navigator: IHabboNavigator;
  newNavigator: IHabboNewNavigator;
};

export function createActions(ctx: ActionContext<NavigatorState, Managers>) {
  const { getState, updateState, managers } = ctx;

  return {
    open: () => {
      updateState({ isOpen: true });
      managers.newNavigator.open();
    },

    close: () => {
      updateState({ isOpen: false });
      managers.newNavigator.close();
    },

    toggle: () => {
      getState().isOpen
        ? ctx.actions.close()
        : ctx.actions.open();
    },

    search: (code: string, filtering: string = '') => {
      updateState({ currentSearchCode: code, isLoading: true });
      managers.newNavigator.performSearch(code, filtering);
    },

    goToRoom: (roomId: number) => {
      managers.navigator.goToPrivateRoom(roomId);
    },

    goHome: (): boolean => {
      return managers.navigator.goToHomeRoom();
    },
  };
}

export type NavigatorActions = ReturnType<typeof createActions>;
```

### `src/modules/navigator/index.ts`

```typescript
import { defineModule } from '../core/defineModule';
import { IID_HabboNavigator, IID_HabboNewNavigator } from '@iid';
import type { IHabboNavigator, IHabboNewNavigator } from '@habbo/navigator';
import type { NavigatorState } from './types';
import { handlers } from './handlers';
import { createActions } from './actions';

export const navigatorModule = defineModule({
  id: 'navigator',

  depends: ['session'],

  managerIIDs: {
    navigator: IID_HabboNavigator,
    newNavigator: IID_HabboNewNavigator,
  },

  initialState: {
    isOpen: false,
    isRoomInfoOpen: false,
    isCreateModalOpen: false,
    currentSearchCode: '',
    topLevelContexts: [],
    searchResults: null,
    homeRoomId: 0,
    isLoading: false,
  } satisfies NavigatorState,

  handlers,
  actions: createActions,
});

export type { NavigatorState } from './types';
export type { NavigatorActions } from './actions';
```

---

## Code UI - Bridge

### `src/ui/bridge/useModule.ts`

```typescript
import { createStore, reconcile } from 'solid-js/store';
import { onMount, onCleanup } from 'solid-js';
import { useModuleRegistry } from './ModuleProvider';
import type { ModuleId, ModuleStateMap, ModuleActionsMap, ModuleAPI } from '@/modules/core';

/**
 * Hook principal pour consommer un module dans l'UI
 */
export function useModule<K extends ModuleId>(moduleId: K): ModuleAPI<K> {
  const registry = useModuleRegistry();
  const module = registry.get(moduleId);

  const [state, setState] = createStore<ModuleStateMap[K]>(
    module.getState() as ModuleStateMap[K]
  );

  onMount(() => {
    const unsubscribe = registry.subscribe(moduleId, (newState) => {
      setState(reconcile(newState as ModuleStateMap[K]));
    });

    onCleanup(unsubscribe);
  });

  return {
    state,
    actions: module.actions as ModuleActionsMap[K],
  };
}
```

### `src/ui/bridge/useSelector.ts`

```typescript
import { createMemo, Accessor } from 'solid-js';
import { useModule } from './useModule';
import type { ModuleId, ModuleStateMap } from '@/modules/core';

/**
 * Hook pour sélectionner une partie du state
 */
export function useSelector<K extends ModuleId, T>(
  moduleId: K,
  selector: (state: ModuleStateMap[K]) => T
): Accessor<T> {
  const { state } = useModule(moduleId);
  return createMemo(() => selector(state));
}
```

---

## Bootstrap - Intégration dans Helium.ts

```typescript
// Dans Helium.ts

import { MessageBus, ModuleRegistry, loggingMiddleware } from '@/modules/core';
import { sessionModule } from '@/modules/session';
import { navigatorModule } from '@/modules/navigator';

// Dans init():

// 1. Crée le MessageBus
this._messageBus = new MessageBus();

if (import.meta.env.DEV) {
  this._messageBus.use(loggingMiddleware);
}

// 2. Crée le ModuleRegistry avec ComponentContext
this._moduleRegistry = new ModuleRegistry(this._context, this._messageBus);

// 3. Enregistre les modules (async car résolution IID)
await this._moduleRegistry.register(sessionModule);
await this._moduleRegistry.register(navigatorModule);

// 4. Connecte le MessageBus au HabboCommunicationManager
this._habboCommunicationManager.onMessage((event) => {
  this._messageBus!.dispatch(event);
});

// 5. Mount UI avec le registry
this._disposeUI = mountUI(uiContainer, this._moduleRegistry);
```

---

## Future Improvements

Les améliorations suivantes sont prévues pour plus tard:

### Plugin API

```typescript
// À implémenter plus tard
export interface HeliumPlugin {
  id: string;
  name: string;
  version: string;
  module: ModuleDefinition<any, any, any>;
  ui?: { windows?: Component[]; toolbarItems?: Component[]; };
}
```

### State Persistence

```typescript
// À implémenter plus tard
export const navigatorModule = defineModule({
  id: 'navigator',
  persist: ['homeRoomId', 'currentSearchCode'], // Clés à persister
  // ...
});
```

---

## Migration Checklist

- [ ] Créer `src/modules/core/` avec MessageBus, ModuleRegistry, types
- [ ] Créer `src/modules/session/`
- [ ] Créer `src/modules/navigator/`
- [ ] Créer `src/ui/bridge/` avec ModuleProvider, useModule, useSelector
- [ ] Ajouter méthode `onMessage` à HabboCommunicationManager
- [ ] Mettre à jour `src/Helium.ts`
- [ ] Migrer les composants UI
- [ ] Supprimer `src/features/` une fois terminé
