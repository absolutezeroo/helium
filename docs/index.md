# Helium Project Documentation

> Generated: 2026-01-31 | Mode: Initial Scan | Scan Level: Exhaustive

## Project Overview

**Helium** is a modern Habbo client renderer built as a lighter, cleaner, and more optimized alternative to Nitro. It aims to recreate the Nitro client functionality using modern web technologies and best practices.

| Property             | Value                    |
|----------------------|--------------------------|
| **Type**             | Monolith Web Application |
| **Primary Language** | TypeScript 5.7           |
| **Runtime**          | Browser (ES2022)         |
| **Graphics Engine**  | PixiJS 8.6               |
| **UI Framework**     | SolidJS 1.9              |
| **DI Container**     | Inversify 6.2            |
| **Build Tool**       | Vite 6.0                 |

## Quick Reference

| Metric                   | Value                                   |
|--------------------------|-----------------------------------------|
| **Source Files**         | ~294                                    |
| **Lines of Code**        | ~7,300                                  |
| **Implemented Features** | Communication, Navigator, Session, UI   |
| **Stub Features**        | Avatar, Catalog, Room Engine, Messenger |

### Entry Points

- **Main Class:** `src/Helium.ts`
- **IoC Container:** `src/iid/container.ts`
- **UI Root:** `src/ui/App.tsx`
- **HTML Entry:** `index.html`

## Generated Documentation

### Core Documents

- [Project Structure](./project-structure.md) - Repository classification and metadata
- [Architecture](./architecture.md) - System design and layer structure
- [Technology Stack](./technology-stack.md) - Libraries, frameworks, and tools
- [Source Tree Analysis](./source-tree-analysis.md) - Directory structure with annotations

### Development

- [Development Guide](./development-guide.md) - Setup, workflow, and conventions
- [API Contracts](./api-contracts.md) - Habbo protocol message reference

### Inventory

- [Component Inventory](./component-inventory.md) - All components and services
- [Existing Documentation](./existing-documentation.md) - Pre-existing docs inventory

## Existing Documentation

| File                      | Description            |
|---------------------------|------------------------|
| [README.md](../README.md) | Basic project overview |
| [CLAUDE.md](../CLAUDE.md) | AI assistant guidance  |

## Reference Sources

The project includes two reference implementations (not part of the build):

| Folder                   | Description                                  | Files  |
|--------------------------|----------------------------------------------|--------|
| `source_as/`             | Original Habbo Flash client (ActionScript 3) | ~4,462 |
| `source_nitro_react/`    | Nitro TypeScript react                       | ~      |
| `source_nitro_renderer/` | Nitro TypeScript client                      | ~2,644 |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Configuration

```typescript
import Helium from './Helium';

await Helium.bootstrap({
    connection: {
        host: 'wss://your-server.com',
        ports: [30000],
        ssoTicket: 'your-ticket',
        autoConnect: true,
    },
});
```

## Implementation Status

### Implemented ✅

| Feature            | Location                   | Description                                 |
|--------------------|----------------------------|---------------------------------------------|
| Core Communication | `src/core/communication/`  | WebSocket, encryption, message handling     |
| Habbo Protocol     | `src/habbo/communication/` | Message registry, 40+ events, 40+ composers |
| Navigator          | `src/habbo/navigator/`     | Room search, favorites, categories          |
| Session Management | `src/habbo/session/`       | User data, rights, settings                 |
| Configuration      | `src/core/configuration/`  | External variables loading                  |
| Localization       | `src/core/localization/`   | Base i18n infrastructure                    |
| UI Framework       | `src/ui/`                  | SolidJS components, stores, bridge          |

### Stub / Planned 📋

| Feature       | Location                | Description                          |
|---------------|-------------------------|--------------------------------------|
| Room Engine   | `src/room/`             | Room rendering, objects, physics     |
| Avatar System | `src/habbo/avatar/`     | Avatar rendering, animation, effects |
| Catalog       | `src/habbo/catalog/`    | Shop, purchasing, offers             |
| Messenger     | `src/habbo/messenger/`  | Friends, chat, notifications         |
| Inventory     | `src/habbo/inventory/`  | Items, effects, badges               |
| Groups        | `src/habbo/groups/`     | Guild management                     |
| Games         | `src/habbo/game/`       | Mini-games, quests                   |
| Moderation    | `src/habbo/moderation/` | Moderation tools                     |

## Next Steps

When creating a brownfield PRD for new features, reference:

1. **Full-stack features:** [Architecture](./architecture.md) + [API Contracts](./api-contracts.md)
2. **UI features:** [Component Inventory](./component-inventory.md)
3. **Protocol features:** [API Contracts](./api-contracts.md)

---

*Generated by BMAD Document Project workflow*
