# Helium Architecture

> Generated: 2026-01-31 | Scan Level: Exhaustive

## Executive Summary

Helium is a modern Habbo client renderer built to be a lighter, cleaner, and more optimized alternative to Nitro. It uses TypeScript with a layered architecture, PixiJS for graphics rendering, SolidJS for reactive UI, and Inversify for dependency injection.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Layer                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │  SolidJS    │ │  Stores     │ │      UIBridge           ││
│  │  Components │ │  (Reactive) │ │  (Manager↔Store)        ││
│  └─────────────┘ └─────────────┘ └─────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Habbo Layer                            │
│  ┌───────────────────┐ ┌──────────────┐ ┌─────────────────┐ │
│  │ Communication     │ │  Navigator   │ │ Session/Config  │ │
│  │ (Protocol, Msgs)  │ │  (Rooms)     │ │ (User Data)     │ │
│  └───────────────────┘ └──────────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Core Layer                             │
│  ┌───────────────────┐ ┌──────────────┐ ┌─────────────────┐ │
│  │ Communication     │ │  Encryption  │ │ Configuration   │ │
│  │ (WebSocket)       │ │ (DH, ArcFour)│ │ (external_vars) │ │
│  └───────────────────┘ └──────────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       IoC Layer                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │             Inversify Container (Singletons)            ││
│  │   ConfigurationManager, CommunicationManager,           ││
│  │   HabboCommunicationManager, HabboNavigator...          ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Layer Descriptions

### 1. UI Layer (`src/ui/`)

**Purpose:** Presentation layer using SolidJS

**Components:**
- `App.tsx` - Root application component
- `components/` - Reusable UI components
  - `navigator/` - Navigator window and room components
  - `toolbar/` - Main toolbar
  - `landing/` - Landing view
  - `common/` - Shared components (LoadingScreen, Text)

**Stores (Reactive State):**
- `connectionStore` - Connection state (connecting, connected, error)
- `sessionStore` - User session data (id, name, figure, etc.)
- `configStore` - Configuration settings
- `navigatorStore` - Navigator state
- `localizationStore` - Localization strings

**UIBridge:** Acts as adapter between Habbo managers (event-based) and SolidJS stores (reactive).

### 2. Habbo Layer (`src/habbo/`)

**Purpose:** Habbo-specific business logic

**Key Components:**

| Component                   | Location         | Purpose                                |
|-----------------------------|------------------|----------------------------------------|
| `HabboCommunicationManager` | `communication/` | Habbo protocol layer, message handling |
| `HabboMessages`             | `communication/` | Message ID → Event/Composer mapping    |
| `SessionDataManager`        | `session/`       | User session data management           |
| `HabboNavigator`            | `navigator/`     | Room navigation and search             |
| `HabboLocalizationManager`  | `localization/`  | Habbo-specific localization            |

**Message System:**
- **Incoming Events:** Server → Client messages (parsers + events)
- **Outgoing Composers:** Client → Server messages

### 3. Core Layer (`src/core/`)

**Purpose:** Low-level infrastructure

**Components:**

| Component                  | Location                    | Purpose                                   |
|----------------------------|-----------------------------|-------------------------------------------|
| `CoreCommunicationManager` | `communication/`            | Connection pooling and lifecycle          |
| `SocketConnection`         | `communication/connection/` | WebSocket wrapper with EventEmitter       |
| `MessageDataWrapper`       | `communication/messages/`   | Binary data reading (readInt, readString) |
| `ByteArray`                | `communication/util/`       | Flash-like big-endian binary handling     |
| `DiffieHellman`            | `communication/encryption/` | Key exchange                              |
| `ArcFour`                  | `communication/encryption/` | Stream cipher                             |
| `ConfigurationManager`     | `configuration/`            | External variables loading                |
| `CoreLocalizationManager`  | `localization/`             | Base localization                         |
| `Logger`                   | `utils/`                    | Logging utility                           |

### 4. IoC Layer (`src/iid/`)

**Purpose:** Dependency injection configuration

**Files:**
- `container.ts` - Inversify container setup
- `types.ts` - Symbol definitions for DI
- `index.ts` - Exports

**Registered Services (Singletons):**
- `ConfigurationManager`
- `CoreCommunicationManager`
- `HabboCommunicationManager`
- `HabboNavigator`

## Communication Protocol

### Connection Flow

```
1. Bootstrap: Helium.bootstrap(config)
2. IoC Setup: setupContainer()
3. PixiJS Init: Application.init()
4. Connect: HabboCommunicationManager.initConnection('habbo')
5. WebSocket: SocketConnection.init(host, port)
6. Handshake: Diffie-Hellman key exchange
7. Auth: SSO ticket authentication
8. Ready: Connection established
```

### Message Flow (Incoming)

```
WebSocket (binary data)
    ↓
SocketConnection.onMessage()
    ↓
MessageDataWrapper (parse header)
    ↓
MessageRegistry.getEventClass(messageId)
    ↓
Event.parser.parse(wrapper)
    ↓
connection.processEvent(event)
    ↓
Registered handlers (e.g., SessionDataManager)
```

### Message Flow (Outgoing)

```
Manager.send(Composer)
    ↓
Composer.getMessageArray()
    ↓
connection.send(composer)
    ↓
SocketConnection.sendBytes(data)
    ↓
WebSocket.send()
```

## Key Design Patterns

### 1. Singleton Services
All managers are registered as singletons in Inversify container.

### 2. Interface-Based Design
Every manager has an `I*` interface (e.g., `IHabboCommunicationManager`).

### 3. Event-Driven Architecture
Managers emit events via EventEmitter3, consumed by handlers and UIBridge.

### 4. Reactive UI Binding
UIBridge connects event-based managers to SolidJS reactive stores.

### 5. Message Registry Pattern
Message IDs mapped to parser and event classes in `HabboMessages`.

## Data Flow Example: User Login

```
1. Server sends AuthenticationOKMessageEvent (ID: 2323)
2. SocketConnection receives binary data
3. MessageRegistry finds AuthenticationOKMessageEvent class
4. AuthenticationOKMessageParser parses data
5. IncomingMessages handler processes event
6. SessionDataManager updates user data
7. SessionDataManager emits 'userDataUpdated'
8. UIBridge receives event
9. sessionStore.setUserData() updates reactive state
10. SolidJS components re-render with new data
```

## File Count by Layer

| Layer     | Files | Status                |
|-----------|-------|-----------------------|
| Core      | ~35   | Implemented           |
| Habbo     | ~165  | Partially Implemented |
| UI        | ~30   | Implemented           |
| IoC       | 3     | Implemented           |
| Room      | ~5    | Stub                  |
| Bootstrap | ~2    | Stub                  |

## Future Modules (Stubs)

The following modules exist as folder structures but are not yet implemented:

- `avatar/` - Avatar rendering and animation
- `catalog/` - Catalog and shop system
- `messenger/` - Friend list and messaging
- `groups/` - Guild/group management
- `inventory/` - User inventory
- `game/` - Mini-games and quests
- `moderation/` - Moderation tools
- `room/` - Room rendering engine
