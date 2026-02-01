# Source Tree Analysis

> Generated: 2026-01-31 | Scan Level: Exhaustive

## Directory Structure

```
helium/
├── 📄 index.html                    # HTML entry point
├── 📄 package.json                  # npm dependencies
├── 📄 tsconfig.json                 # TypeScript config
├── 📄 vite.config.ts                # Vite build config
├── 📄 README.md                     # Project readme
├── 📄 CLAUDE.md                     # AI assistant guide
│
├── 📁 src/                          # Source code (294 files)
│   ├── 📄 index.ts                  # Library exports
│   ├── 📄 Helium.ts                 # ⭐ Main entry point
│   │
│   ├── 📁 core/                     # Core infrastructure (~35 files)
│   │   ├── 📁 communication/        # Network layer
│   │   │   ├── 📁 connection/       # WebSocket wrapper
│   │   │   │   ├── SocketConnection.ts
│   │   │   │   └── IConnection.ts
│   │   │   ├── 📁 encryption/       # Crypto (DH, ArcFour)
│   │   │   │   ├── DiffieHellman.ts
│   │   │   │   ├── ArcFour.ts
│   │   │   │   └── CryptoTools.ts
│   │   │   ├── 📁 messages/         # Message infrastructure
│   │   │   │   ├── MessageDataWrapper.ts
│   │   │   │   ├── MessageRegistry.ts
│   │   │   │   └── IMessageEvent.ts
│   │   │   ├── 📁 util/             # Binary utilities
│   │   │   │   ├── ByteArray.ts
│   │   │   │   ├── Byte.ts
│   │   │   │   ├── Short.ts
│   │   │   │   └── Long.ts
│   │   │   ├── 📁 wireformat/       # Wire protocol
│   │   │   ├── CoreCommunicationManager.ts
│   │   │   └── ICoreCommunicationManager.ts
│   │   │
│   │   ├── 📁 configuration/        # Config management
│   │   │   ├── ConfigurationManager.ts
│   │   │   └── IConfigurationManager.ts
│   │   │
│   │   ├── 📁 localization/         # Base localization
│   │   │   ├── CoreLocalizationManager.ts
│   │   │   └── ILocalizationManager.ts
│   │   │
│   │   ├── 📁 utils/                # Utilities
│   │   │   └── Logger.ts
│   │   │
│   │   ├── 📁 assets/               # Asset loading (stub)
│   │   ├── 📁 runtime/              # Runtime (stub)
│   │   ├── 📁 window/               # Window management (stub)
│   │   └── 📄 index.ts
│   │
│   ├── 📁 habbo/                    # Habbo business logic (~165 files)
│   │   ├── 📁 communication/        # ⭐ Protocol layer
│   │   │   ├── HabboCommunicationManager.ts
│   │   │   ├── HabboMessages.ts     # Message registry
│   │   │   ├── 📁 messages/
│   │   │   │   ├── 📁 incoming/     # Server→Client events
│   │   │   │   │   ├── 📁 handshake/   # Auth messages
│   │   │   │   │   ├── 📁 navigator/   # Room navigation
│   │   │   │   │   ├── 📁 avatar/      # Avatar updates
│   │   │   │   │   ├── 📁 inventory/   # Inventory data
│   │   │   │   │   └── ...
│   │   │   │   ├── 📁 outgoing/     # Client→Server composers
│   │   │   │   │   ├── 📁 handshake/   # Auth composers
│   │   │   │   │   ├── 📁 navigator/   # Nav composers (25+)
│   │   │   │   │   └── ...
│   │   │   │   └── 📁 parser/       # Message parsers
│   │   │   └── 📁 demo/             # Demo/test handlers
│   │   │
│   │   ├── 📁 navigator/            # ⭐ Navigator system
│   │   │   ├── HabboNavigator.ts
│   │   │   ├── IHabboNavigator.ts
│   │   │   ├── NavigatorMessageHandler.ts
│   │   │   ├── 📁 data/             # Room data classes (13+)
│   │   │   └── 📁 domain/           # Domain models
│   │   │
│   │   ├── 📁 session/              # Session management
│   │   │   ├── SessionDataManager.ts
│   │   │   └── ISessionDataManager.ts
│   │   │
│   │   ├── 📁 localization/         # Habbo localization
│   │   │   ├── HabboLocalizationManager.ts
│   │   │   └── 📁 enum/
│   │   │
│   │   ├── 📁 avatar/               # Avatar (stub - 20+ folders)
│   │   ├── 📁 catalog/              # Catalog (stub - 15+ folders)
│   │   ├── 📁 messenger/            # Messenger (stub)
│   │   ├── 📁 friendlist/           # Friends (stub)
│   │   ├── 📁 inventory/            # Inventory (stub)
│   │   ├── 📁 groups/               # Groups (stub)
│   │   ├── 📁 room/                 # Room logic (stub)
│   │   ├── 📁 game/                 # Games (stub)
│   │   ├── 📁 quest/                # Quests (stub)
│   │   ├── 📁 moderation/           # Moderation (stub)
│   │   └── 📄 index.ts
│   │
│   ├── 📁 room/                     # Room engine (stub)
│   │   └── (placeholder files)
│   │
│   ├── 📁 iid/                      # IoC Container
│   │   ├── container.ts             # ⭐ DI setup
│   │   ├── types.ts                 # Symbol definitions
│   │   └── index.ts
│   │
│   ├── 📁 ui/                       # UI Layer (~30 files)
│   │   ├── 📄 App.tsx               # ⭐ Root component
│   │   ├── 📄 UIBridge.ts           # Manager↔Store bridge
│   │   ├── 📄 styles.css            # TailwindCSS styles
│   │   ├── 📁 components/
│   │   │   ├── 📁 navigator/        # Navigator UI
│   │   │   │   ├── Navigator.tsx
│   │   │   │   ├── NavigatorWindow.tsx
│   │   │   │   ├── 📁 tabs/         # Tab components
│   │   │   │   ├── 📁 rooms/        # Room list/cards
│   │   │   │   ├── 📁 roominfo/     # Room info panel
│   │   │   │   ├── 📁 search/       # Search UI
│   │   │   │   ├── 📁 categories/   # Category UI
│   │   │   │   ├── 📁 create/       # Room creation
│   │   │   │   └── 📁 common/       # Shared nav components
│   │   │   ├── 📁 toolbar/
│   │   │   │   └── Toolbar.tsx
│   │   │   ├── 📁 landing/
│   │   │   │   └── LandingView.tsx
│   │   │   └── 📁 common/
│   │   │       ├── LoadingScreen.tsx
│   │   │       └── Text.tsx
│   │   └── 📁 stores/               # SolidJS stores
│   │       ├── connectionStore.ts
│   │       ├── sessionStore.ts
│   │       ├── configStore.ts
│   │       ├── navigatorStore.ts
│   │       └── localizationStore.ts
│   │
│   └── 📁 bootstrap/                # Bootstrap (stub)
│
├── 📁 source_as/                    # Reference: AS3 source (~4,462 files)
├── 📁 source_nitro/                 # Reference: Nitro source (~2,644 files)
│
├── 📁 dist/                         # Build output
├── 📁 node_modules/                 # Dependencies
├── 📁 docs/                         # Generated documentation
└── 📁 _bmad/                        # BMAD workflow config
```

## Legend

- ⭐ = Key entry point or critical file
- (stub) = Folder structure exists but not implemented
- (~N files) = Approximate file count

## Critical Folders Summary

| Folder | Purpose | Status |
|--------|---------|--------|
| `src/Helium.ts` | Main application bootstrap | ✅ Complete |
| `src/core/communication/` | WebSocket, encryption, messages | ✅ Complete |
| `src/habbo/communication/` | Habbo protocol, message registry | ✅ Complete |
| `src/habbo/navigator/` | Room navigation system | ✅ Complete |
| `src/habbo/session/` | User session management | ✅ Complete |
| `src/ui/` | SolidJS UI components | ✅ Complete |
| `src/iid/` | Dependency injection | ✅ Complete |
| `src/room/` | Room rendering engine | ⏳ Stub |
| `src/habbo/avatar/` | Avatar system | ⏳ Stub |
| `src/habbo/catalog/` | Shop/catalog | ⏳ Stub |

## File Type Distribution

| Extension | Count | Purpose |
|-----------|-------|---------|
| `.ts` | ~260 | TypeScript source |
| `.tsx` | ~27 | SolidJS components |
| `.css` | 1 | TailwindCSS styles |
| `.json` | 3 | Config files |
| `.html` | 1 | Entry point |
| `.md` | 2 | Documentation |

## Entry Points

1. **`index.html`** - Browser entry, loads Helium
2. **`src/index.ts`** - Library exports
3. **`src/Helium.ts`** - Main class, bootstrap method
4. **`src/iid/container.ts`** - IoC container setup
5. **`src/ui/App.tsx`** - Root UI component
