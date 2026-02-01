# Technology Stack

> Generated: 2026-01-31 | Scan Level: Exhaustive

## Core Technologies

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Language** | TypeScript | 5.7.2 | Static typing, modern JS features |
| **Runtime** | Browser (ES2022) | - | Web platform target |
| **Build Tool** | Vite | 6.0.0 | Fast dev server, HMR, production builds |
| **Transpilation** | Babel | 7.x | Decorator support for Inversify |

## Graphics & Rendering

| Technology | Version | Purpose |
|------------|---------|---------|
| PixiJS | 8.6.6 | 2D WebGL/Canvas rendering engine |
| - | - | Room rendering, avatar display, animations |

## UI Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| SolidJS | 1.9.11 | Reactive UI components |
| TailwindCSS | 4.1.18 | Utility-first styling |

## Architecture & Patterns

| Technology | Version | Purpose |
|------------|---------|---------|
| Inversify | 6.2.1 | Dependency injection container |
| EventEmitter3 | 5.0.1 | Event-driven communication |
| reflect-metadata | 0.2.2 | Decorator metadata for DI |

## Utilities

| Technology | Version | Purpose |
|------------|---------|---------|
| pako | 2.1.0 | zlib compression/decompression |

## Development Dependencies

| Technology | Version | Purpose |
|------------|---------|---------|
| @babel/plugin-proposal-decorators | 7.28.6 | TypeScript decorator support |
| @babel/plugin-transform-class-properties | 7.28.6 | Class property transforms |
| vite-plugin-solid | 2.11.10 | SolidJS integration with Vite |
| vite-plugin-babel | 1.4.1 | Babel integration with Vite |
| solid-devtools | 0.34.5 | Development debugging tools |

## Architecture Pattern

The project follows a **Layered Architecture** with:

1. **Core Layer** - Low-level infrastructure
2. **Habbo Layer** - Business logic
3. **UI Layer** - Presentation (SolidJS)
4. **IoC Layer** - Dependency injection configuration

### Dependency Flow

```
UI Layer (SolidJS)
     ↓
  UIBridge
     ↓
Habbo Layer (Managers)
     ↓
Core Layer (Communication, Utils)
     ↓
IoC Container (Inversify)
```

## Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | npm dependencies and scripts |
| `tsconfig.json` | TypeScript compiler configuration |
| `vite.config.ts` | Vite build configuration |

## Path Aliases

Configured in both `tsconfig.json` and `vite.config.ts`:

| Alias | Path |
|-------|------|
| `@/` | `src/` |
| `@core/` | `src/core/` |
| `@habbo/` | `src/habbo/` |
| `@room/` | `src/room/` |
| `@iid/` | `src/iid/` |
| `@ui/` | `src/ui/` |
