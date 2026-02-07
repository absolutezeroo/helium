# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Helium is a modern Habbo client renderer built with TypeScript, PixiJS v8, SolidJS, and Inversify for dependency injection. It aims to be a lighter alternative to Nitro.

## CRITICAL: Documentation obligatoire

Avant de coder quoi que ce soit, consulter dans cet ordre:

1. **`docs/STYLEGUIDE.md`** - Conventions de code strictes (nommage, formatage Allman, templates Composer/Parser/Event/Manager)
2. **`docs/IMPLEMENTATION_STATUS.md`** - État d'implémentation par module (ce qui est fait / ce qui manque)
3. **`docs/architectures/<module>-architecture.md`** - Architecture AS3 du module concerné
4. **`source_as/habbo/<module>/`** - Code source AS3 (source de vérité absolue)

### Mise à jour de la documentation

Après chaque implémentation significative (nouveau module, nouveau handler, ensemble de messages):
- **Mettre à jour `docs/IMPLEMENTATION_STATUS.md`** pour cocher les éléments implémentés
- Changer le statut des éléments de ❌ à ✅
- Mettre à jour les pourcentages et barres de progression
- Mettre à jour la date de dernière mise à jour

## CRITICAL RULE: AS3 Source is the Source of Truth

**The `source_as/` folder contains the original ActionScript 3 Habbo client code. This is the ABSOLUTE source of truth.**

### MANDATORY RULES (NO EXCEPTIONS)

1. **NEVER invent code** - Always read the AS3 source FIRST before implementing anything
2. **ALWAYS follow AS3 structure** - Class names, method names, interfaces, inheritance chains must match
3. **NEVER simplify the architecture** - If AS3 has handlers, interfaces, or delegation patterns, implement them
4. **CHECK interfaces and implementations** - If AS3 class implements `IRoomHandlerListener`, so must ours
5. **PRESERVE relationships** - If AS3 has `RoomSessionManager` creating handlers that call back via `IRoomHandlerListener`, replicate exactly
6. **READ the full AS3 file** - Check all methods, properties, interfaces, imports, and inheritance

### Before Writing ANY Code

```
1. Read docs/STYLEGUIDE.md if not already familiar with conventions
2. Check docs/IMPLEMENTATION_STATUS.md to see current module status
3. Find the AS3 source file: source_as/habbo/<module>/<ClassName>.as
4. Read the entire file including:
   - Class declaration (extends, implements)
   - All imports (reveals dependencies)
   - All methods and their implementations
   - All properties
5. Check related interfaces: I<ClassName>.as
6. Check handler/listener patterns: source_as/habbo/<module>/handler/
7. Only then start implementing, following STYLEGUIDE.md conventions
8. After implementing, update docs/IMPLEMENTATION_STATUS.md
```

### Common Mistakes to AVOID

- ❌ Creating a simplified version without reading AS3
- ❌ Skipping interfaces that AS3 implements
- ❌ Ignoring handler/listener patterns
- ❌ Not checking what events AS3 dispatches
- ❌ Not implementing all methods from interfaces
- ❌ Not following STYLEGUIDE.md conventions (Allman braces, naming, etc.)
- ❌ Forgetting to update IMPLEMENTATION_STATUS.md after implementing
- ✅ Read AS3 → Understand → Implement exactly → Update status

## Code Style (STYLEGUIDE.md)

**Full reference: `docs/STYLEGUIDE.md`**

Quick summary of critical conventions:

| Rule | Convention |
|------|-----------|
| Braces | Allman style (opening brace on new line) |
| Classes | PascalCase |
| Interfaces | I + PascalCase (e.g., `ISessionDataManager`) |
| Private fields | `_` prefix + camelCase (e.g., `_userId`) |
| Constants | UPPER_SNAKE_CASE |
| Methods | camelCase |
| Imports | `import type` for types, path aliases preferred |
| Exports | Named exports only (no `export default`) |
| JSDoc | Required on classes/public methods with `@see` AS3 reference |
| dispose() | Always last method, checks `_disposed` flag |

### Template patterns (see STYLEGUIDE.md for full templates):
- **Composers**: `IMessageComposer<ConstructorParameters<typeof ClassName>>` pattern
- **Parsers**: `IMessageParser` with `flush()` + `parse(wrapper)` pattern
- **Events**: `extends MessageEvent` with single `callback` constructor param
- **Managers**: `@injectable()` + `EventEmitter<Events>` + interface

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

## Implementation Status Summary

**Full reference: `docs/IMPLEMENTATION_STATUS.md`** (updated 2026-02-07)

```
Progression globale: ████░░░░░░░░░░░░░░░░ ~19%
```

| Module | Progression | Statut |
|--------|------------|--------|
| Core Communication | ~90% | Avancé |
| Core Assets | ~92% | Avancé |
| Localization | ~100% | Complet |
| Configuration | ~100% | Complet |
| Inventory | ~100% | Complet |
| Room Engine (root) | ~100% | Complet |
| Session | ~52% | En cours |
| Room Objects | ~36% | En cours |
| Navigator (ENGINE) | ~29% | Partiel |
| Communication Messages | ~21% | Partiel |
| Avatar | 0% | Non commencé |
| Catalog | 0% | Non commencé |
| Sound | 0% | Non commencé |
| +18 autres modules | 0% | Non commencé |

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
├── bridge/           # Engine ↔ UI bridge
├── components/       # SolidJS components
└── hooks/            # Custom hooks
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
   - Read `docs/STYLEGUIDE.md` for coding conventions
   - Check `docs/IMPLEMENTATION_STATUS.md` for current module status
   - Read the architecture doc in `docs/architectures/<feature>-architecture.md`
   - Read the AS3 source in `source_as/habbo/<feature>/`
   - Identify ENGINE files to port

2. **Implementation:**
   - Create TypeScript equivalents following AS3 structure AND STYLEGUIDE.md
   - Register in IoC container (`src/iid/container.ts`)
   - Add types to `src/iid/types.ts`
   - Create store if UI needed (`src/ui/stores/`)

3. **After implementation:**
   - Update `docs/IMPLEMENTATION_STATUS.md` (check items, update percentages)
   - Run `npm run dev` to verify compilation

4. **Testing:**
   - `npm run dev` to start dev server
   - Connect to a Habbo server to test
