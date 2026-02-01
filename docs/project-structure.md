# Helium Project Structure

> Generated: 2026-01-31 | Scan Level: Exhaustive | Mode: Initial Scan

## Repository Classification

| Property | Value |
|----------|-------|
| **Repository Type** | Monolith |
| **Project Type** | Web Application |
| **Primary Language** | TypeScript |
| **Build Tool** | Vite 6.0 |
| **UI Framework** | SolidJS 1.9 |
| **Graphics Engine** | PixiJS 8.6 |
| **DI Container** | Inversify 6.2 |
| **Styling** | TailwindCSS 4.1 |

## Project Purpose

Helium is a modern Habbo client renderer built as a lighter, cleaner, and more optimized alternative to Nitro. It aims to recreate the Nitro client functionality using modern web technologies and best practices.

## Source Reference Folders

The project contains two reference source folders (not part of the build):

| Folder | Purpose | File Count |
|--------|---------|------------|
| `source_as/` | Original Habbo Flash client (ActionScript 3) | ~4,462 files |
| `source_nitro/` | Nitro TypeScript client (reference implementation) | ~2,644 files |

These folders serve as the "source of truth" for implementing features and understanding the Habbo protocol.

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
  }
}
```
