# Engine ↔ UI Architecture

> Documentation de l'architecture de communication entre les managers (Engine) et les composants SolidJS (UI).

## Vue d'ensemble

Helium utilise une architecture de séparation stricte entre la logique métier (Engine) et l'interface utilisateur (UI). Cette séparation permet:

- **Testabilité**: Les managers peuvent être testés sans UI
- **Réutilisabilité**: L'UI peut être remplacée sans toucher à l'Engine
- **Maintenabilité**: Chaque couche a une responsabilité claire

```
┌─────────────────────────────────────────────────────────────────────┐
│                           UI Layer (SolidJS)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │
│  │  Navigator  │  │  Inventory  │  │   Session   │  ... Components   │
│  │  Component  │  │  Component  │  │  Component  │                  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                  │
│         │                │                │                          │
│         │ read state     │ read state     │ read state               │
│         ▼                ▼                ▼                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │
│  │ navigator   │  │  inventory  │  │   session   │  ... Stores       │
│  │   Store     │  │    Store    │  │    Store    │  (Signals)        │
│  └─────────────┘  └─────────────┘  └─────────────┘                  │
│         ▲                ▲                ▲                          │
│         │ update state   │ update state   │ update state             │
│         └────────────────┼────────────────┘                          │
│                          │                                           │
│  ┌───────────────────────┴───────────────────────────────────────┐  │
│  │                        UIBridge                                │  │
│  │  - Holds manager references                                    │  │
│  │  - Listens to message events                                   │  │
│  │  - Updates stores with data                                    │  │
│  │  - Exposes actions for components                              │  │
│  └───────────────────────┬───────────────────────────────────────┘  │
└──────────────────────────┼──────────────────────────────────────────┘
                           │ calls managers
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Engine Layer (Managers)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │
│  │   Habbo     │  │   Habbo     │  │   Session   │  ... Managers     │
│  │  Navigator  │  │  Inventory  │  │   Manager   │  (Inversify IoC)  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                  │
│         │                │                │                          │
│         │ send/receive   │ send/receive   │ send/receive             │
│         ▼                ▼                ▼                          │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │               HabboCommunicationManager                        │  │
│  │  - WebSocket connection                                        │  │
│  │  - Message encoding/decoding                                   │  │
│  │  - Event dispatching                                           │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Composants clés

### 1. Stores (src/ui/stores/)

Les stores sont des conteneurs d'état réactif utilisant les signaux SolidJS.

**Règles strictes:**
- ✅ Contenir uniquement de l'état réactif (signaux)
- ✅ Écouter les message events pour mettre à jour l'état
- ✅ Exposer des setters pour UIBridge
- ❌ Ne JAMAIS garder de référence à un manager
- ❌ Ne JAMAIS appeler directement les méthodes d'un manager

```typescript
// ✅ BON: Store avec état réactif uniquement
function createNavigatorStore() {
    const [isOpen, setIsOpen] = createSignal(false);
    const [results, setResults] = createSignal(null);

    // Écoute les messages
    function init() {
        registerMessageEvent(SearchResultsEvent, (_, parser) => {
            setResults(parser.data);
        });
    }

    return {
        isOpen,
        results,
        init,
        // Setters pour UIBridge
        openNavigator: () => setIsOpen(true),
        closeNavigator: () => setIsOpen(false),
    };
}

// ❌ MAUVAIS: Store avec référence manager
function createBadStore() {
    let manager: IManager | null = null;  // ❌ Référence manager!

    function doAction() {
        manager?.performAction();  // ❌ Appel direct au manager!
    }
}
```

### 2. UIBridge (src/ui/uiBridge.ts)

Le pont central entre Engine et UI. C'est le **seul** endroit qui détient des références aux managers.

**Responsabilités:**
- Détenir les références aux managers
- Connecter les managers aux stores au démarrage
- Écouter les message events et mettre à jour les stores
- Exposer des actions que les composants peuvent appeler

```typescript
class UIBridge {
    private _navigator: IHabboNavigator | null = null;

    // Connexion au démarrage
    connectNavigator(nav: IHabboNavigator) {
        this._navigator = nav;
        navigatorStore.init();  // Active les listeners du store
    }

    // Action exposée aux composants
    openNavigator() {
        navigatorStore.openNavigator();  // Met à jour l'état UI
        this._navigator?.open();          // Appelle le manager
    }

    performSearch(code: string) {
        navigatorStore.updateSearchCode(code);
        this._navigator?.performSearch(code);
    }
}
```

### 3. Components (src/ui/components/)

Les composants SolidJS qui affichent l'UI.

**Règles:**
- Lire l'état depuis les stores (réactif)
- Appeler UIBridge pour les actions
- Ne jamais accéder aux managers directement

```typescript
function Navigator() {
    // Lecture réactive depuis le store
    const results = () => navigatorStore.results();

    // Actions via UIBridge
    const handleSearch = (query: string) => {
        uiBridge.performSearch(query);
    };

    return (
        <NavigatorWindow
            results={results()}
            onSearch={handleSearch}
            onClose={() => uiBridge.closeNavigator()}
        />
    );
}
```

## Flux de données

### 1. Données entrantes (Server → UI)

```
Server
   │
   │ WebSocket message
   ▼
HabboCommunicationManager
   │
   │ Dispatch message event
   ▼
Store (via registerMessageEvent)
   │
   │ Update signal
   ▼
Component (réactive)
   │
   │ Re-render automatique
   ▼
UI Updated
```

**Exemple: Réception des résultats de recherche**

```typescript
// 1. Store écoute l'event
registerMessageEvent(NavigatorSearchResultSetMessageEvent, (_, parser) => {
    setNavigatorSearchResults(parser.searchResult);
});

// 2. Component utilise le signal
const results = () => navigatorStore.navigatorSearchResults();

// 3. UI se met à jour automatiquement
<RoomList rooms={results()} />
```

### 2. Actions sortantes (UI → Server)

```
Component
   │
   │ User interaction
   ▼
UIBridge (action method)
   │
   ├─→ Store.updateState()  // Update UI state
   │
   └─→ Manager.action()     // Call engine
         │
         │ Send composer
         ▼
      Server
```

**Exemple: Effectuer une recherche**

```typescript
// 1. Component appelle UIBridge
const handleTabChange = (searchCode: string) => {
    uiBridge.performNavigatorSearch(searchCode);
};

// 2. UIBridge met à jour le store ET appelle le manager
performNavigatorSearch(searchCode: string, filtering: string = '') {
    navigatorStore.updateSearchCode(searchCode);  // UI state
    this._newNavigator?.performSearch(searchCode, filtering);  // Engine
}

// 3. Manager envoie le message au serveur
// 4. Serveur répond avec les résultats
// 5. Le flux "données entrantes" prend le relais
```

## Patterns par type de store

### Pattern A: Store simple (sessionStore)

Pour les stores qui ne font que recevoir des données sans actions.

```typescript
function createSessionStore() {
    const [userData, setUserData] = createSignal<UserData | null>(null);

    return {
        userData,
        setUserData,  // Exposé pour UIBridge
        isLoggedIn: () => userData() !== null,
    };
}

// UIBridge gère les message events
registerMessageEvent(UserObjectMessageEvent, (_, parser) => {
    sessionStore.setUserData({ ... });
});
```

### Pattern B: Store avec actions (navigatorStore, inventoryStore)

Pour les stores qui ont besoin d'actions utilisateur.

```typescript
function createNavigatorStore() {
    const [isOpen, setIsOpen] = createSignal(false);
    const [results, setResults] = createSignal(null);

    // Message listeners
    function init() {
        registerMessageEvent(SearchResultsEvent, (_, parser) => {
            setResults(parser.data);
        });
    }

    // Pure UI state actions (no manager needed)
    function openNavigator() { setIsOpen(true); }
    function closeNavigator() { setIsOpen(false); }

    // State setters for UIBridge
    function updateSearchCode(code: string) { ... }

    return {
        isOpen,
        results,
        init,
        openNavigator,
        closeNavigator,
        updateSearchCode,
    };
}

// UIBridge expose les actions qui nécessitent le manager
class UIBridge {
    openNavigator() {
        navigatorStore.openNavigator();
        this._newNavigator?.open();
    }

    performSearch(code: string) {
        navigatorStore.updateSearchCode(code);
        this._newNavigator?.performSearch(code);
    }
}
```

### Pattern C: Store avec callback (inventoryStore)

Pour les stores qui ont besoin de logique complexe lors de la réception de messages.

```typescript
function createInventoryStore() {
    let dataCallback: InventoryDataCallback | null = null;

    function init() {
        registerMessageEvent(FurniListMessageEvent, (_, parser) => {
            dataCallback?.onFurniList(parser);  // Delegate to UIBridge
        });
    }

    function setDataCallback(cb: InventoryDataCallback | null) {
        dataCallback = cb;
    }

    return { init, setDataCallback, ... };
}

// UIBridge fournit le callback avec accès au manager
connectInventory(inventory: IHabboInventory) {
    inventoryStore.init();
    inventoryStore.setDataCallback({
        onFurniList: (parser) => {
            // Logique complexe avec accès à inventory manager
            inventory.furniModel.insertFurniture(...);
            inventoryStore.updateFurni(...);
        },
    });
}
```

## Bonnes pratiques

### ✅ À faire

1. **Utiliser UIBridge pour toutes les actions**
   ```typescript
   // Component
   onClick={() => uiBridge.openInventory()}
   ```

2. **Stores = état réactif pur**
   ```typescript
   const [state, setState] = createSignal(initialValue);
   ```

3. **Components lisent les stores directement**
   ```typescript
   const items = () => inventoryStore.furniGroups();
   ```

4. **Message events dans init()**
   ```typescript
   function init() {
       registerMessageEvent(Event, handler);
   }
   ```

### ❌ À éviter

1. **Référence manager dans un store**
   ```typescript
   // MAUVAIS
   let manager: IManager | null = null;
   ```

2. **Appel manager depuis un component**
   ```typescript
   // MAUVAIS
   onClick={() => navigator.search(query)}
   ```

3. **Logic métier dans les components**
   ```typescript
   // MAUVAIS
   if (inventory.isCategoryInitialized(cat)) { ... }
   ```

## Fichiers clés

| Fichier | Rôle |
|---------|------|
| `src/ui/uiBridge.ts` | Pont central Engine↔UI |
| `src/ui/stores/index.ts` | Export de tous les stores |
| `src/ui/stores/navigator/navigatorStore.ts` | État du navigator |
| `src/ui/stores/inventory/inventoryStore.ts` | État de l'inventaire |
| `src/ui/stores/sessionStore.ts` | État de la session utilisateur |
| `src/ui/components/navigator/Navigator.tsx` | Composant navigator |
| `src/ui/components/inventory/Inventory.tsx` | Composant inventaire |

## Migration d'un ancien pattern

Si vous trouvez un store avec référence manager:

```typescript
// AVANT (mauvais)
function createOldStore() {
    let manager: IManager | null = null;

    function connect(mgr: IManager) {
        manager = mgr;
    }

    function doAction() {
        manager?.action();
    }

    return { connect, doAction };
}
```

Migrer vers:

```typescript
// APRÈS (bon)
function createNewStore() {
    const [state, setState] = createSignal(...);

    function init() {
        registerMessageEvent(Event, handler);
    }

    // UI-only state changes
    function updateState(value) {
        setState(value);
    }

    return { state, init, updateState };
}

// Dans UIBridge
class UIBridge {
    private _manager: IManager | null = null;

    connectManager(mgr: IManager) {
        this._manager = mgr;
        newStore.init();
    }

    doAction() {
        newStore.updateState(...);
        this._manager?.action();
    }
}
```
