# Helium Rulebook v1.0

> **SINGLE SOURCE OF TRUTH** — The AI can ONLY flag violations of these rules. Nothing else.

## Binding Constraints

- You may ONLY flag code that violates one or more numbered rules below.
- If code does not violate any numbered rule, it is **ACCEPTED** — even if you personally dislike it.
- You must NEVER invent new rules not listed below.
- You must NEVER flag code based on personal preference, stylistic opinion, or "best practice" not codified here.
- You must NEVER suggest improvements beyond the scope of these rules.
- You must NEVER flag the same logical issue under multiple rules (pick the most specific one).
- If you are unsure whether something violates a rule, it does **NOT** violate the rule. Ambiguity favors the code.

---

## TYPESCRIPT (TS-001 to TS-010)

| Rule   | Description |
|--------|-------------|
| TS-001 | No `any` type. Use `unknown`, generics, or explicit types. |
| TS-002 | All functions must have explicit return types. |
| TS-003 | No `as` casts unless interfacing with untyped external libraries (must have comment justifying). |
| TS-004 | All class members must have explicit access modifiers (`private`, `protected`, `public`). |
| TS-005 | Non-reassigned variables must use `const`. |
| TS-006 | Type-only imports must use `import type`. |
| TS-007 | No `console.log/warn/error` outside of a dedicated Logger service. |
| TS-008 | Optional parameters must have a default value or explicit `\| undefined`. |
| TS-009 | No non-null assertions (`!`) unless immediately after a type guard. |
| TS-010 | Enums must be `const enum` unless their runtime value is needed. |

## ARCHITECTURE (AR-001 to AR-008)

| Rule   | Description |
|--------|-------------|
| AR-001 | No class exceeds 300 lines (excluding imports and type definitions). |
| AR-002 | No inheritance chain deeper than 2 levels. |
| AR-003 | No circular dependencies between files or modules. |
| AR-004 | Renderer layer must not import from network layer (and vice versa). |
| AR-005 | Cross-module communication must use events/observables, not direct method calls. |
| AR-006 | Each file exports exactly one main class/function (+ associated types/interfaces). |
| AR-007 | No concrete class used as a dependency type — use interfaces. |
| AR-008 | No duplicate logic blocks exceeding 10 lines across files. |

## PERFORMANCE (PF-001 to PF-006)

| Rule   | Description |
|--------|-------------|
| PF-001 | No `new` keyword inside `update()`, `render()`, `tick()`, or any function called per frame. |
| PF-002 | All event listeners must be cleaned up in `dispose()` or `destroy()`. |
| PF-003 | No `Object.keys()`, `Object.values()`, `Object.entries()` inside per-frame loops. |
| PF-004 | Arrays with known size must be pre-allocated. |
| PF-005 | No string concatenation with `+` inside loops — use template literals or `join()`. |
| PF-006 | Off-screen objects must not be rendered (culling required). |

## SECURITY (SC-001 to SC-005)

| Rule   | Description |
|--------|-------------|
| SC-001 | No `innerHTML` without prior sanitization. |
| SC-002 | All incoming packets must be validated (size + type) before processing. |
| SC-003 | No sensitive data (tokens, passwords) stored in localStorage/sessionStorage. |
| SC-004 | All WebSocket connections must use `wss://`. |
| SC-005 | No blind `JSON.parse()` without try/catch and schema validation. |

## NAMING (NM-001 to NM-008)

| Rule   | Description |
|--------|-------------|
| NM-001 | Classes use PascalCase. |
| NM-002 | Interfaces are prefixed with `I`. |
| NM-003 | Constants use UPPER_SNAKE_CASE. |
| NM-004 | Variables and functions use camelCase. |
| NM-005 | Booleans are prefixed with `is`, `has`, `can`, or `should`. |
| NM-006 | Event handlers are prefixed with `on` or `handle`. |
| NM-007 | No obfuscated names remain (`_SafeStr_*`, `_local_*`, single letters except loop indices `i`, `j`, `k`). |
| NM-008 | Enum values use UPPER_SNAKE_CASE. |

## IMPORTS (IM-001 to IM-005)

| Rule   | Description |
|--------|-------------|
| IM-001 | No unused imports. |
| IM-002 | No relative paths deeper than `../../`. |
| IM-003 | Import order: 1) external packages 2) absolute internal 3) relative. |
| IM-004 | No barrel re-exports (`index.ts`) that trigger side effects. |
| IM-005 | No circular imports. |

## CONVERSION FIDELITY (CF-001 to CF-005)

| Rule   | Description |
|--------|-------------|
| CF-001 | AS3 `Dictionary` must be converted to `Map<K, V>`, not plain objects. |
| CF-002 | AS3 `Vector.<T>` must be converted to `T[]` or `Array<T>`. |
| CF-003 | AS3 `ByteArray` must be converted to `ArrayBuffer`, `Uint8Array`, or `DataView`. |
| CF-004 | AS3 `getTimer()` must be converted to `performance.now()`. |
| CF-005 | AS3 null-return patterns must have explicit `\| null` return types in TypeScript. |

---

**Total: 42 rules. No more, no less.**

## Version History

| Version | Date       | Changes |
|---------|------------|---------|
| v1.0    | 2026-02-06 | Initial rulebook — 42 rules across 7 categories |
