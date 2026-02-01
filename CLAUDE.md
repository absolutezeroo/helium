# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Helium is a modern Habbo client renderer built with TypeScript, PixiJS v8, SolidJS, and Inversify for dependency injection. It aims to be a lighter alternative to Nitro.

## CRITICAL RULE: AS3 Source is the Source of Truth

**The `source_as/` folder contains the original ActionScript 3 Habbo client code. This is the ABSOLUTE source of truth.**

- NEVER invent code without first understanding how AS3 implements it
- ALWAYS read the corresponding AS3 files before implementing features
- Follow AS3 patterns and data structures exactly
- When in doubt, consult `source_as/habbo/` for the correct implementation

## Architecture Documentation

Comprehensive documentation exists in `docs/architectures` for each AS3 module, categorizing files as:
- **ENGINE**: Business logic, data models, message handlers - code we NEED to implement
- **VIEW**: UI rendering, windows, dialogs - code we IGNORE (SolidJS handles UI)

| Documentation File              | ENGINE | VIEW | Description                   |
|---------------------------------|--------|------|-------------------------------|
| `room-architecture.md`          | 313    | 0    | Room rendering engine (CORE)  |
| `session-architecture.md`       | 77     | 0    | Session/user data management  |
| `ui-architecture.md`            | 95     | 274  | UI handlers, events, messages |
| `avatar-architecture.md`        | ~70    | ~50  | Avatar rendering system       |
| `catalog-architecture.md`       | 62     | 43   | Catalog/shop system           |
| `inventory-architecture.md`     | 33     | 18   | Inventory management          |
| `roomevents-architecture.md`    | 39     | 204  | Wired furniture system        |
| `sound-architecture.md`         | 28     | 0    | Sound/music system            |
| `navigator-architecture.md`     | 25     | 45+  | Room navigator                |
| `help-architecture.md`          | 22     | 12   | Help/CFH system               |
| `friendlist-architecture.md`    | 18     | 21   | Friend list                   |
| `toolbar-architecture.md`       | 18     | 18   | Toolbar                       |
| `freeflowchat-architecture.md`  | 16     | 15   | Chat bubbles                  |
| `notifications-architecture.md` | 16     | 16   | Notifications                 |
| `quest-architecture.md`         | 15     | 16   | Quests/achievements           |
| `game-architecture.md`          | 42     | 16   | SnowWar game                  |
| `moderation-architecture.md`    | 20     | 16   | Moderation tools              |
| `friendbar-architecture.md`     | 30     | 113  | Friend bar/landing            |
| `groups-architecture.md`        | 6      | 15   | Groups/guilds                 |
| `tracking-architecture.md`      | 10     | 0    | Analytics                     |
| `configuration-architecture.md` | 6      | 0    | Configuration                 |
| `localization-architecture.md`  | 5      | 0    | Localization                  |
| `advertisement-architecture.md` | 5      | 0    | Advertisements                |
| `messenger-architecture.md`     | 5      | 2    | Private messaging             |
| `campaign-architecture.md`      | 2      | 3    | Calendar campaigns            |
| `phonenumber-architecture.md`   | 3      | 4    | Phone verification            |
| `nux-architecture.md`           | 1      | 3    | New user experience           |
| `window-architecture.md`        | 14     | 78   | Window system                 |
| `utils-architecture.md`         | 22     | 6    | Utilities                     |

**Total: ~1000 ENGINE files to implement, ~1000 VIEW files to ignore**

## Build Commands

```bash
npm install       # Install dependencies
npm run dev       # Start Vite dev server
npm run build     # TypeScript compile + Vite production build
npm run preview   # Preview production build
```

No test or lint commands are currently configured.

## Architecture

### Layer Structure

| Layer | Location     | Purpose                                                        |
|-------|--------------|----------------------------------------------------------------|
| Core  | `src/core/`  | Low-level utilities, communication, compression, asset loading |
| Room  | `src/room/`  | Room rendering engine, object management                       |
| Habbo | `src/habbo/` | Habbo-specific game logic (avatar, catalog, inventory, etc.)   |
| IoC   | `src/iid/`   | Inversify container setup and DI symbols                       |

### Key Entry Points

- **`src/Helium.ts`** - Main application class (singleton), bootstraps PixiJS and IoC container
- **`src/iid/container.ts`** - Inversify container configuration, binds all service singletons
- **`index.html`** - HTML entry point that imports and bootstraps Helium

### Dependency Injection

Uses Inversify with symbols defined in `src/iid/types.ts`. All managers are registered as singletons:

- `CommunicationManager` - WebSocket connection management
- `HabboCommunicationManager` - Habbo protocol layer
- `AvatarRenderManager`, `CatalogManager`, `ConfigurationManager`, etc.

### Communication Protocol

```
SocketConnection (WebSocket + EventEmitter3)
    → CoreCommunicationManager (connection pooling)
    → HabboCommunicationManager (Habbo protocol)
    → Message Registry (ID → Event/Composer mapping)
```

- Diffie-Hellman key exchange + ArcFour encryption
- Messages registered in `src/habbo/communication/HabboMessages.ts`
- Incoming messages use Event classes, outgoing use Composer classes
- `MessageDataWrapper` provides typed read methods: `readString()`, `readInt()`, `readLong()`

### Path Aliases

Configured in both `tsconfig.json` and `vite.config.ts`:

- `@/` → `src/`
- `@core/` → `src/core/`
- `@habbo/` → `src/habbo/`
- `@room/` → `src/room/`
- `@iid/` → `src/iid/`

### Conventions

- Interface-based design: every manager has an `I*` interface
- `dispose()` methods for cleanup
- `ByteArray` class for Flash-like binary data handling (big-endian)

## UI Architecture (SolidJS)

The UI is built with SolidJS instead of Flash/AS3 windows:

```
src/ui/
├── stores/           # Reactive stores (navigatorStore, inventoryStore, etc.)
├── components/       # SolidJS components
└── uiBridge.ts       # Bridge between engine and UI
```

### Pattern: Engine → Store → UI

1. **Engine classes** emit events (EventEmitter3)
2. **Stores** listen to engine events and update reactive signals
3. **UI components** read signals and render reactively

```typescript
// Engine (HabboNewNavigator.ts)
this.emit('searchResults', results);

// Store (navigatorStore.ts)
newNav.on('searchResults', (results) => setNavigatorSearchResults(results));

// Component reads signal
const results = navigatorStore.navigatorSearchResults();
```

## Key Modules

### Core Systems (100% ENGINE)
- **room**: Room rendering, objects, tiles, walls, furniture, avatars
- **session**: User sessions, permissions, room sessions
- **avatar**: Avatar structure, animations, figure rendering
- **sound**: Audio playback, TRAX sequencer, music

### Mixed Systems (ENGINE + VIEW in AS3)
- **navigator**: Search, room navigation, history
- **inventory**: Items, trading, marketplace
- **catalog**: Pages, offers, purchases
- **friendlist**: Friends, requests, relationships

### Communication (Ignore `source_as/habbo/communication/messages/`)
Messages are already mapped in `src/habbo/communication/HabboMessages.ts`.
Focus on ENGINE logic, not re-implementing parsers/composers.

## Development Workflow

1. **Before implementing a feature:**
   - Read the architecture doc in `docs/<feature>-architecture.md`
   - Read the AS3 source in `source_as/habbo/<feature>/`
   - Identify ENGINE files to port

2. **Implementation:**
   - Create TypeScript equivalents following AS3 structure
   - Register in IoC container (`src/iid/container.ts`)
   - Add types to `src/iid/types.ts`
   - Create store if UI needed (`src/ui/stores/`)

3. **Testing:**
   - `npm run dev` to start dev server
   - Connect to a Habbo server to test
