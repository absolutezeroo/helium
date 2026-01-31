# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Helium is a modern Habbo client renderer built with TypeScript, PixiJS v8, and Inversify for dependency injection. It aims to be a lighter alternative to Nitro.

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
