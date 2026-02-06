/**
 * Helium Rulebook v1.0 — Structured rule definitions
 *
 * 42 rules across 7 categories. No more, no less.
 * This is the SINGLE SOURCE OF TRUTH for the convergence audit system.
 */

import type { Rule, RuleCategory, Severity } from './types.js';

function defineRule(
  id: string,
  category: RuleCategory,
  severity: Severity,
  description: string,
  automatable: boolean
): Rule {
  return Object.freeze({ id, category, severity, description, automatable });
}

export const RULEBOOK_VERSION = 'v1.0';

export const RULES: readonly Rule[] = Object.freeze([
  // --- TYPESCRIPT (TS-001 to TS-010) ---
  defineRule('TS-001', 'TYPESCRIPT', 'major', 'No `any` type. Use `unknown`, generics, or explicit types.', true),
  defineRule('TS-002', 'TYPESCRIPT', 'major', 'All functions must have explicit return types.', true),
  defineRule('TS-003', 'TYPESCRIPT', 'major', 'No `as` casts unless interfacing with untyped external libraries (must have comment justifying).', true),
  defineRule('TS-004', 'TYPESCRIPT', 'major', 'All class members must have explicit access modifiers (`private`, `protected`, `public`).', true),
  defineRule('TS-005', 'TYPESCRIPT', 'major', 'Non-reassigned variables must use `const`.', false),
  defineRule('TS-006', 'TYPESCRIPT', 'major', 'Type-only imports must use `import type`.', false),
  defineRule('TS-007', 'TYPESCRIPT', 'major', 'No `console.log/warn/error` outside of a dedicated Logger service.', true),
  defineRule('TS-008', 'TYPESCRIPT', 'major', 'Optional parameters must have a default value or explicit `| undefined`.', false),
  defineRule('TS-009', 'TYPESCRIPT', 'major', 'No non-null assertions (`!`) unless immediately after a type guard.', true),
  defineRule('TS-010', 'TYPESCRIPT', 'major', 'Enums must be `const enum` unless their runtime value is needed.', true),

  // --- ARCHITECTURE (AR-001 to AR-008) ---
  defineRule('AR-001', 'ARCHITECTURE', 'major', 'No class exceeds 300 lines (excluding imports and type definitions).', true),
  defineRule('AR-002', 'ARCHITECTURE', 'major', 'No inheritance chain deeper than 2 levels.', false),
  defineRule('AR-003', 'ARCHITECTURE', 'major', 'No circular dependencies between files or modules.', false),
  defineRule('AR-004', 'ARCHITECTURE', 'major', 'Renderer layer must not import from network layer (and vice versa).', true),
  defineRule('AR-005', 'ARCHITECTURE', 'major', 'Cross-module communication must use events/observables, not direct method calls.', false),
  defineRule('AR-006', 'ARCHITECTURE', 'major', 'Each file exports exactly one main class/function (+ associated types/interfaces).', false),
  defineRule('AR-007', 'ARCHITECTURE', 'major', 'No concrete class used as a dependency type — use interfaces.', false),
  defineRule('AR-008', 'ARCHITECTURE', 'major', 'No duplicate logic blocks exceeding 10 lines across files.', false),

  // --- PERFORMANCE (PF-001 to PF-006) ---
  defineRule('PF-001', 'PERFORMANCE', 'critical', 'No `new` keyword inside `update()`, `render()`, `tick()`, or any function called per frame.', true),
  defineRule('PF-002', 'PERFORMANCE', 'critical', 'All event listeners must be cleaned up in `dispose()` or `destroy()`.', false),
  defineRule('PF-003', 'PERFORMANCE', 'major', 'No `Object.keys()`, `Object.values()`, `Object.entries()` inside per-frame loops.', true),
  defineRule('PF-004', 'PERFORMANCE', 'major', 'Arrays with known size must be pre-allocated.', false),
  defineRule('PF-005', 'PERFORMANCE', 'major', 'No string concatenation with `+` inside loops — use template literals or `join()`.', true),
  defineRule('PF-006', 'PERFORMANCE', 'major', 'Off-screen objects must not be rendered (culling required).', false),

  // --- SECURITY (SC-001 to SC-005) ---
  defineRule('SC-001', 'SECURITY', 'critical', 'No `innerHTML` without prior sanitization.', true),
  defineRule('SC-002', 'SECURITY', 'critical', 'All incoming packets must be validated (size + type) before processing.', false),
  defineRule('SC-003', 'SECURITY', 'critical', 'No sensitive data (tokens, passwords) stored in localStorage/sessionStorage.', true),
  defineRule('SC-004', 'SECURITY', 'critical', 'All WebSocket connections must use `wss://`.', true),
  defineRule('SC-005', 'SECURITY', 'critical', 'No blind `JSON.parse()` without try/catch and schema validation.', true),

  // --- NAMING (NM-001 to NM-008) ---
  defineRule('NM-001', 'NAMING', 'minor', 'Classes use PascalCase.', true),
  defineRule('NM-002', 'NAMING', 'minor', 'Interfaces are prefixed with `I`.', true),
  defineRule('NM-003', 'NAMING', 'minor', 'Constants use UPPER_SNAKE_CASE.', false),
  defineRule('NM-004', 'NAMING', 'minor', 'Variables and functions use camelCase.', false),
  defineRule('NM-005', 'NAMING', 'minor', 'Booleans are prefixed with `is`, `has`, `can`, or `should`.', false),
  defineRule('NM-006', 'NAMING', 'minor', 'Event handlers are prefixed with `on` or `handle`.', false),
  defineRule('NM-007', 'NAMING', 'minor', 'No obfuscated names remain (`_SafeStr_*`, `_local_*`, single letters except loop indices).', true),
  defineRule('NM-008', 'NAMING', 'minor', 'Enum values use UPPER_SNAKE_CASE.', true),

  // --- IMPORTS (IM-001 to IM-005) ---
  defineRule('IM-001', 'IMPORTS', 'minor', 'No unused imports.', false),
  defineRule('IM-002', 'IMPORTS', 'minor', 'No relative paths deeper than `../../`.', true),
  defineRule('IM-003', 'IMPORTS', 'minor', 'Import order: 1) external packages 2) absolute internal 3) relative.', true),
  defineRule('IM-004', 'IMPORTS', 'minor', 'No barrel re-exports (`index.ts`) that trigger side effects.', false),
  defineRule('IM-005', 'IMPORTS', 'minor', 'No circular imports.', false),

  // --- CONVERSION FIDELITY (CF-001 to CF-005) ---
  defineRule('CF-001', 'CONVERSION_FIDELITY', 'major', 'AS3 `Dictionary` must be converted to `Map<K, V>`, not plain objects.', false),
  defineRule('CF-002', 'CONVERSION_FIDELITY', 'major', 'AS3 `Vector.<T>` must be converted to `T[]` or `Array<T>`.', false),
  defineRule('CF-003', 'CONVERSION_FIDELITY', 'major', 'AS3 `ByteArray` must be converted to `ArrayBuffer`, `Uint8Array`, or `DataView`.', false),
  defineRule('CF-004', 'CONVERSION_FIDELITY', 'major', 'AS3 `getTimer()` must be converted to `performance.now()`.', true),
  defineRule('CF-005', 'CONVERSION_FIDELITY', 'major', 'AS3 null-return patterns must have explicit `| null` return types in TypeScript.', false),
]);

export function getRuleById(id: string): Rule | undefined {
  return RULES.find((r) => r.id === id);
}

export function getRulesByCategory(category: RuleCategory): readonly Rule[] {
  return RULES.filter((r) => r.category === category);
}

export function getRulesBySeverity(severity: Severity): readonly Rule[] {
  return RULES.filter((r) => r.severity === severity);
}

export function getAutomatableRules(): readonly Rule[] {
  return RULES.filter((r) => r.automatable);
}

export function getManualRules(): readonly Rule[] {
  return RULES.filter((r) => !r.automatable);
}
