# Helium Project Structure

> **Generated:** 2026-02-01 | **Mode:** Full Rescan (Exhaustive)

## Overview

Helium is a modern Habbo client renderer built with TypeScript, PixiJS v8, SolidJS, and Inversify. It aims to be a
lighter alternative to Nitro.

## Repository Classification

| Property             | Value           |
|----------------------|-----------------|
| **Repository Type**  | Monolith        |
| **Project Type**     | Web Application |
| **Primary Language** | TypeScript 5.7  |
| **Build Tool**       | Vite 6.Rien 0   |
| **UI Framework**     | SolidJS 1.9     |
| **Graphics Engine**  | PixiJS 8.6      |
| **DI Container**     | Inversify 6.2   |
| **Styling**          | TailwindCSS 4.1 |

## Source Reference Folders

The project contains **4 reference sources** (not part of the build):

| Folder                    | Purpose                                         | Files | LOC     |
|---------------------------|-------------------------------------------------|-------|---------|
| `source_as_win63/`              | **Original Habbo AS3 client** - SOURCE OF TRUTH | 4,462 | ~44,217 |
| `source_nitro_react/`     | Nitro React client - UI/Store patterns          | 860   | ~24,620 |
| `source_nitro_renderer/`  | Nitro PixiJS renderer - Rendering patterns      | 2,644 | ~8,766  |
| `source_nitro_converter/` | Asset converter - JSON mappers                  | 229   | -       |

**CRITICAL:** Always read `source_as_win63/` before implementing features.

## Main Codebase Structure

```
src/                         # 503 files, ~18,417 LOC
├── core/                    # Low-level infrastructure (46 files)
│   ├── communication/       # WebSocket, encryption, protocol (32 files)
│   ├── localization/        # Game text and language (8 files)
│   ├── runtime/             # Configuration (2 files)
│   └── utils/               # Logger, utilities (2 files)
│
├── habbo/                   # Habbo game logic (368 files)
│   ├── communication/       # Message protocol (266 files)
│   │   ├── messages/incoming/   # 62 event classes
│   │   ├── messages/outgoing/   # 74 composers
│   │   └── messages/parser/     # 79 parsers
│   ├── inventory/           # Items, badges, trading (53 files)
│   ├── navigator/           # Room navigation (24 files)
│   ├── session/             # User session (9 files)
│   ├── configuration/       # Settings (8 files)
│   └── localization/        # Game i18n (7 files)
│
├── room/                    # Room rendering engine (stub)
│
├── ui/                      # SolidJS interface (84 files)
│   ├── components/          # UI components (66 files)
│   └── stores/              # Reactive stores (13 files)
│
├── iid/                     # Inversify DI container (3 files)
│
└── Helium.ts                # Main application singleton (283 LOC)
```

## Implementation Status

### Implemented Modules (6)

| Module          | Files | Status | Description                      |
|-----------------|-------|--------|----------------------------------|
| `communication` | 266   | 95% ✅  | Message protocol nearly complete |
| `inventory`     | 53    | 75%    | Badges, bots, effects, trading   |
| `navigator`     | 24    | 40%    | Room search, favorites           |
| `session`       | 9     | 70%    | User data, permissions           |
| `configuration` | 8     | 60%    | Core settings                    |
| `localization`  | 7     | 50%    | i18n system                      |

### Stub Modules (26 - Not Implemented)

```
avatar/         room/           catalog/        friendbar/
friendlist/     help/           game/           groups/
moderation/     sound/          toolbar/        notifications/
freeflowchat/   roomevents/     quest/          messenger/
nux/            phonenumber/    tracking/       userclassification/
window/         advertisement/  campaign/       utils/
util/
```

## Message System Summary

| Type          | Count | Location             |
|---------------|-------|----------------------|
| **Events**    | 62    | `messages/incoming/` |
| **Composers** | 74    | `messages/outgoing/` |
| **Parsers**   | 79    | `messages/parser/`   |
| **Total**     | 215   | -                    |

## Part Metadata

```json
{
    "part_id": "helium",
    "project_type_id": "web",
    "display_name": "Helium Client",
    "root_path": "/",
    "technologies": {
        "language": "TypeScript 5.7",
        "runtime": "Browser (ES2022)",
        "framework": "SolidJS 1.9.11",
        "graphics": "PixiJS 8.6.6",
        "di_container": "Inversify 6.2.1",
        "styling": "TailwindCSS 4.1.18",
        "build_tool": "Vite 6.0.0",
        "compression": "pako 2.1.0",
        "events": "EventEmitter3 5.0.1"
    },
    "reference_sources": [
        "source_as (AS3 - Source of Truth)",
        "source_nitro_react (UI patterns)",
        "source_nitro_renderer (PixiJS patterns)",
        "source_nitro_converter (JSON mappers)"
    ]
}
```

## Key Entry Points

| File                   | Purpose                    |
|------------------------|----------------------------|
| `src/Helium.ts`        | Main application singleton |
| `src/iid/container.ts` | IoC container setup        |
| `index.html`           | HTML entry point           |
| `vite.config.ts`       | Build configuration        |

## Path Aliases

| Alias     | Path         | Usage                |
|-----------|--------------|----------------------|
| `@/`      | `src/`       | General imports      |
| `@core/`  | `src/core/`  | Communication, utils |
| `@habbo/` | `src/habbo/` | Game logic           |
| `@room/`  | `src/room/`  | Room engine          |
| `@iid/`   | `src/iid/`   | DI container         |
