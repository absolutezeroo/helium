# Contexte du projet Helium

Ce document fournit le contexte complet de l'architecture et du projet. À lire AVANT toute implémentation.

## Vue d'ensemble

**Helium** est un port TypeScript/PixiJS v8 du client Habbo Hotel Flash, organisé en monorepo pnpm. L'objectif est de créer un client plus léger que Nitro tout en restant fidèle à l'architecture AS3 d'origine.

### Stack technique

| Technologie     | Rôle                                               |
|-----------------|----------------------------------------------------|
| TypeScript      | Langage principal (strict mode)                    |
| PixiJS v8       | Rendu 2D (rooms, avatars, mobilier)                |
| SolidJS         | Framework UI réactif (remplace les fenêtres Flash) |
| EventEmitter3   | Communication inter-composants dans l'engine       |
| pnpm workspaces | Gestion du monorepo                                |
| Vite            | Bundler et serveur de développement                |

### Monorepo

```
helium/
├── packages/
│   ├── helium-engine/     Moteur (zéro connaissance UI)
│   └── helium-client/     Client (SolidJS, dépend de engine)
├── sources/
│   ├── source_as_win63/   Source AS3 primaire (~4 465 fichiers)
│   └── source_as_flash/   Source AS3 secondaire (~7 160 fichiers)
├── docs/
│   ├── CONTEXT.md          Ce fichier
│   ├── PATTERNS.md         Templates d'implémentation
│   ├── STYLEGUIDE.md       Guide de style complet
│   ├── IMPLEMENTATION_STATUS.md  Suivi d'avancement
│   └── architectures/     Architecture AS3 par module
├── CLAUDE.md              Instructions Claude Code
└── AGENTS.md              Instructions agents IA universelles
```

## Architecture engine

### Structure des couches

```
packages/helium-engine/src/
│
├── core/                   @core/    BAS-NIVEAU
│   ├── communication/      WebSocket, protocole, encryption
│   │   ├── connections/    SocketConnection, gestion de pool
│   │   ├── encryption/     Diffie-Hellman, ArcFour
│   │   └── messages/       MessageComposer, MessageParser, MessageEvent
│   ├── assets/             Chargement et gestion des assets
│   │   ├── loaders/        AssetManager, GraphicAssetCollection
│   │   └── content/        RoomContentLoader
│   ├── di/                 Système d'injection de dépendances
│   │   ├── Component.ts    Classe de base pour tous les managers
│   │   └── ComponentContext.ts  Résolution de dépendances
│   ├── common/             Utilitaires partagés (Point, Vector3d, etc.)
│   └── utils/              ByteArray, compression, crypto
│
├── habbo/                  @habbo/   LOGIQUE DE JEU
│   ├── communication/      HabboCommunicationManager, HabboMessages
│   ├── session/            SessionDataManager, RoomSessionManager
│   ├── avatar/             AvatarRenderManager, figure, animations
│   ├── catalog/            CatalogManager, pages, offres
│   ├── inventory/          InventoryManager, trading, marketplace
│   ├── navigator/          HabboNewNavigator, recherche, filtres
│   ├── room/               HabboRoomFactory (pont habbo ↔ room engine)
│   └── [autres modules]/   friendlist, sound, groups, etc.
│
├── room/                   @room/    MOTEUR DE ROOM
│   ├── RoomManager.ts      Gestion des instances de room
│   ├── RoomInstance.ts      Instance individuelle d'une room
│   ├── object/             Objets de room (furniture, avatars, tiles)
│   │   ├── RoomObject.ts   Objet de base
│   │   ├── logic/          Logiques d'objets (FurnitureLogic, AvatarLogic)
│   │   └── visualization/  Visualisations (FurnitureVisualization, etc.)
│   ├── renderer/           Rendu PixiJS (RoomRenderer, RoomSpriteCanvas)
│   ├── utils/              Géométrie, stacking, cameras
│   └── floorplan/          Parsing et rendu du plan de sol
│
└── iid/                    @iid/     SYMBOLES DI
    └── index.ts            Tous les IIDs (Symbol) pour le système Component
```

### Injection de dépendances (système Component)

Le projet utilise un système DI custom basé sur `Component` :

```typescript
// Définition d'un IID
export const IID_IRoomEngine = Symbol('IRoomEngine');

// Un manager est un Component
export class RoomEngine extends Component implements IRoomEngine
{
    // Les dépendances sont résolues via le ComponentContext
    // Component.unlock() est appelé quand toutes les deps sont prêtes
}
```

**Règle critique** : Ne JAMAIS overrider `get events()` dans une sous-classe de Component. Le getter `events` est utilisé par le système DI pour la résolution de dépendances.

### Protocole de communication

```
Client WebSocket
    → SocketConnection (WebSocket + EventEmitter3)
    → CoreCommunicationManager (pool de connexions)
    → HabboCommunicationManager (couche protocole Habbo)
    → Message Registry (ID serveur → Event/Composer)
```

- **Encryption** : Diffie-Hellman key exchange + ArcFour
- **Messages entrants** : Le serveur envoie un ID → le registre trouve l'Event correspondant → le Parser extrait les données
- **Messages sortants** : Le code crée un Composer → `getMessageArray()` sérialise → envoi via WebSocket
- **Registre** : `HabboMessages.ts` mappe les IDs serveur aux classes Event/Composer

### Alias de chemins

| Alias     | Engine résout vers         | Client résout vers            |
|-----------|----------------------------|-------------------------------|
| `@core/`  | `src/core/`                | `../helium-engine/src/core/`  |
| `@habbo/` | `src/habbo/`               | `../helium-engine/src/habbo/` |
| `@room/`  | `src/room/`                | `../helium-engine/src/room/`  |
| `@iid/`   | `src/iid/`                 | `../helium-engine/src/iid/`   |
| `@ui/`    | N/A (interdit dans engine) | `src/`                        |
| `@/`      | N/A (interdit dans engine) | `src/`                        |

## Architecture client

### Structure

```
packages/helium-client/src/
├── Helium.ts          Shell applicatif singleton, bootstrap engine + PixiJS + UI
├── HeliumMain.ts      Orchestrateur engine (crée et enregistre tous les managers)
├── App.tsx            Composant SolidJS racine
├── api/               Pont engine ↔ UI (accès typé aux managers)
├── components/        Composants SolidJS (rooms, navigation, chat, etc.)
├── hooks/             Hooks SolidJS personnalisés
└── stores/            Stores réactifs (bridge events engine → signaux SolidJS)
```

### Pattern Engine → Store → UI

```typescript
// 1. Engine class émet un event
class HabboNewNavigator extends Component
{
    onSearchResults(data: SearchResultData): void
    {
        this.emit('searchResults', data);
    }
}

// 2. Store écoute et met à jour un signal SolidJS
const [searchResults, setSearchResults] = createSignal<SearchResultData | null>(null);
navigator.on('searchResults', (data) => setSearchResults(data));

// 3. Composant lit le signal et rend
function NavigatorResults()
{
    const results = searchResults();
    return <div>{results?.rooms.map(room => <RoomCard room={room} />)}</div>;
}
```

L'engine ne sait JAMAIS rien des stores ou composants. La séparation est stricte.

## Sources AS3

### Deux dossiers disponibles

| Dossier                  | Fichiers | Racine des packages | Usage                                          |
|--------------------------|----------|---------------------|------------------------------------------------|
| `sources/win63_version/` | ~4 465   | `habbo/`, `room/`   | **PRIMAIRE** — contient tout le moteur core    |
| `sources/flash_version/` | ~7 160   | `com/sulake/habbo/` | **SECONDAIRE** — version Nitro, plus détaillée |

### Mapping des chemins

```
sources/win63_version/habbo/<module>/   ↔   sources/flash_version/com/sulake/habbo/<module>/
sources/win63_version/room/             ↔   sources/flash_version/com/sulake/room/
```

### Classification ENGINE vs VIEW

Chaque fichier AS3 est classé comme ENGINE ou VIEW dans `docs/architectures/<module>-architecture.md` :

- **ENGINE** : Logique métier, modèles de données, handlers, message parsers/composers, managers → **À implémenter en TypeScript**
- **VIEW** : Fenêtres UI, dialogs, composants visuels d'interface → **À ignorer** (SolidJS les remplace)

### Statistiques globales

~1 000 fichiers ENGINE à implémenter, ~1 000 fichiers VIEW à ignorer.

## Documentation par module

| Doc                         | ENGINE | VIEW | Description                   |
|-----------------------------|--------|------|-------------------------------|
| `room-architecture.md`      | 313    | 0    | Moteur de room (CORE)         |
| `session-architecture.md`   | 77     | 0    | Gestion des sessions          |
| `ui-architecture.md`        | 95     | 274  | Handlers UI, events, messages |
| `avatar-architecture.md`    | ~70    | ~50  | Système de rendu avatar       |
| `catalog-architecture.md`   | 62     | 43   | Système de catalogue          |
| `inventory-architecture.md` | 33     | 18   | Gestion d'inventaire          |
| `sound-architecture.md`     | 28     | 0    | Système audio                 |
| `navigator-architecture.md` | 25     | 45+  | Navigateur de rooms           |
| `game-architecture.md`      | 42     | 16   | SnowWar                       |
| Autres (20+ modules)        | ~200   | ~500 | Voir `docs/architectures/`    |

## Points d'entrée clés

| Fichier                                                                       | Rôle                               |
|-------------------------------------------------------------------------------|------------------------------------|
| `packages/helium-client/index.html`                                           | Point d'entrée HTML                |
| `packages/helium-client/src/Helium.ts`                                        | Singleton applicatif, bootstrap    |
| `packages/helium-client/src/HeliumMain.ts`                                    | Enregistrement des managers engine |
| `packages/helium-engine/src/habbo/communication/HabboMessages.ts`             | Registre de tous les messages      |
| `packages/helium-engine/src/habbo/communication/HabboCommunicationManager.ts` | Couche protocole                   |
| `packages/helium-engine/src/room/RoomManager.ts`                              | Gestionnaire de rooms              |
| `packages/helium-engine/src/iid/index.ts`                                     | Tous les symboles DI               |
