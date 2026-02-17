# AGENTS.md — Helium

Universal instructions for all AI assistants (Cursor, Windsurf, Codex, Copilot, Claude, etc.)

## Project

Helium: TypeScript/PixiJS v8 port of the Habbo Hotel Flash client. pnpm monorepo with `helium-engine` (engine, zero UI) and `helium-client` (SolidJS).

```bash
pnpm install && pnpm dev    # Dev server
pnpm build                   # Production build
```

## The fundamental rule

**Read the AS3 source code before writing ANY implementation.**

- Primary: `sources/win63_version/habbo/<module>/<Class>.as`
- Secondary: `sources/flash_version/com/sulake/habbo/<module>/<Class>.as`

No AS3 source read = invalid implementation. Period.

We fully reuse the lifecycle system from the original AS3 source. The class hierarchy, dispose patterns, flush/parse cycles, and object management must match the AS3 architecture. The only divergences allowed are JS-specific performance optimizations documented in `docs/STYLEGUIDE.md` section **Performance**.

## Work protocol (mandatory phases)

Inspired by the BMAD method (Breakthrough Method for Agile AI Driven Development). Every implementation task MUST follow these phases in order. No phase may be skipped.

### Phase 1 — Research (BLOCKING)

Until this phase is complete, writing code is FORBIDDEN.

- [ ] Read `docs/CONTEXT.md` to understand the architecture
- [ ] Find and read the AS3 source file IN ITS ENTIRETY:
  - Class declaration (`extends`, `implements`)
  - All imports (reveal dependencies)
  - ALL methods and their complete implementation
  - ALL properties
  - Constructor logic
- [ ] Read the AS3 interface (`I<Class>.as`)
- [ ] Check for handler/listener patterns in the `handler/` subdirectory
- [ ] Check `docs/IMPLEMENTATION_STATUS.md` for current status

### Phase 2 — Plan

- [ ] Identify all classes, interfaces, and relationships from the AS3
- [ ] Map AS3 inheritance to TypeScript equivalents
- [ ] Identify ENGINE files to port (ignore VIEW files)
- [ ] List required dependencies

### Phase 3 — Implementation

- [ ] Follow conventions from `docs/STYLEGUIDE.md` (Allman, naming, etc.)
- [ ] Follow templates from `docs/PATTERNS.md` for Composers/Parsers/Events/Managers
- [ ] Engine code → `packages/helium-engine/src/`
- [ ] Client code → `packages/helium-client/src/`
- [ ] Preserve AS3 class names, method names, interfaces, and inheritance chains

### Phase 4 — Validation

- [ ] Verify compilation with `pnpm dev`
- [ ] Update `docs/IMPLEMENTATION_STATUS.md` (change ❌ → ✅, update percentages)
- [ ] Check performance rules (see `docs/STYLEGUIDE.md` section **Performance**):
  - No `Array.includes()`/`indexOf()` for frequent lookups → use `Set`/`Map`
  - No object allocation in render loops or high-frequency handlers
  - No `new OffscreenCanvas()` / `Texture.from()` without caching
  - No `getImageData`/`putImageData` for color transforms → use GPU
  - All listeners have a matching `removeEventListener`/`off()` in `dispose()`

## Architecture boundaries

```
helium-engine (ZERO UI knowledge)              helium-client (depends on engine)
├── core/    Low-level, communication          ├── components/  SolidJS components
├── habbo/   Game logic                        ├── stores/      Reactive state
├── room/    Room engine                       ├── hooks/       SolidJS hooks
└── iid/     DI symbols                        └── api/         Engine ↔ UI bridge
```

**CRITICAL**: The engine must NEVER import from the client. The flow is strictly client → engine.

Data pattern: `Engine emits event → Store listens and updates signal → Component reads signal`

## Code style (summary)

- **Allman** braces (opening brace on its own line)
- Interfaces: `I` + PascalCase (`IRoomSession`)
- Private fields: `_` + camelCase (`_roomId`)
- Constants: UPPER_SNAKE_CASE
- Named exports only (never `export default`)
- `import type` for type-only imports
- `dispose()` always last method, checks `_disposed`

Full reference: `docs/STYLEGUIDE.md`

## AS3 sources

| Directory                | Priority  | Package roots       | Files  |
|--------------------------|-----------|---------------------|--------|
| `sources/win63_version/` | PRIMARY   | `habbo/`, `room/`   | ~4,465 |
| `sources/flash_version/` | Secondary | `com/sulake/habbo/` | ~7,160 |

AS3 file classification:
- **ENGINE**: Business logic, data models, handlers, parsers, composers → **TO IMPLEMENT**
- **VIEW**: UI windows, dialogs, display components → **TO IGNORE** (SolidJS replaces them)

See `docs/architectures/<module>-architecture.md` for per-file classification.

## Key patterns

See `docs/PATTERNS.md` for full templates with code examples.

- **Composers**: `extends MessageComposer<TupleType>` with `_data` and `getMessageArray()`
- **Parsers**: `implements IMessageParser` with `flush()` + `parse(wrapper)`
- **Events**: `extends MessageEvent implements IMessageEvent` with `callback` parameter in constructor
- **Managers**: DI Component with IID registration

## Known pitfalls

1. **Never override `get events()`** in Component subclasses (breaks the DI event system — use a different property name like `sessionEvents`)
2. **Use `createObjectInternal()`** not `createRoomObject()` from container classes (infinite recursion)
3. **The engine ↔ client boundary is strict**: the engine has ZERO UI knowledge
4. **AS3 VIEW files are IGNORED**: SolidJS replaces the Flash UI
5. **Performance**: `Set`/`Map` for lookups, no allocation in render loops, cache textures, viewport culling. See `docs/STYLEGUIDE.md` section Performance and `docs/PATTERNS.md` section 0
