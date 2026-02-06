/**
 * Rule checker registry — maps rule IDs to their automated check functions.
 */

import type { AuditContext, Violation } from '../types.js';
import { checkTS001, checkTS003, checkTS004, checkTS007, checkTS009, checkTS010 } from './typescript.js';
import { checkAR001, checkAR004 } from './architecture.js';
import { checkPF001, checkPF003, checkPF005 } from './performance.js';
import { checkSC001, checkSC003, checkSC004, checkSC005 } from './security.js';
import { checkNM001, checkNM002, checkNM007, checkNM008 } from './naming.js';
import { checkIM002, checkIM003 } from './imports.js';
import { checkCF004 } from './conversion.js';

export type RuleChecker = (ctx: AuditContext) => Violation[];

/**
 * Registry of all automated rule checkers.
 * Rules not listed here require manual/AI-assisted review.
 */
export const RULE_CHECKERS: ReadonlyMap<string, RuleChecker> = new Map<string, RuleChecker>([
  // TypeScript
  ['TS-001', checkTS001],
  ['TS-003', checkTS003],
  ['TS-004', checkTS004],
  ['TS-007', checkTS007],
  ['TS-009', checkTS009],
  ['TS-010', checkTS010],

  // Architecture
  ['AR-001', checkAR001],
  ['AR-004', checkAR004],

  // Performance
  ['PF-001', checkPF001],
  ['PF-003', checkPF003],
  ['PF-005', checkPF005],

  // Security
  ['SC-001', checkSC001],
  ['SC-003', checkSC003],
  ['SC-004', checkSC004],
  ['SC-005', checkSC005],

  // Naming
  ['NM-001', checkNM001],
  ['NM-002', checkNM002],
  ['NM-007', checkNM007],
  ['NM-008', checkNM008],

  // Imports
  ['IM-002', checkIM002],
  ['IM-003', checkIM003],

  // Conversion Fidelity
  ['CF-004', checkCF004],
]);

/**
 * List of rule IDs that require manual or AI-assisted review.
 */
export const MANUAL_REVIEW_RULES: readonly string[] = [
  'TS-002',  // Explicit return types — needs AST analysis
  'TS-005',  // const vs let — needs data flow analysis
  'TS-006',  // Type-only imports — needs type system awareness
  'TS-008',  // Optional params — needs AST analysis
  'AR-002',  // Inheritance depth — needs class hierarchy analysis
  'AR-003',  // Circular dependencies — needs dependency graph
  'AR-005',  // Cross-module communication patterns
  'AR-006',  // Single export per file
  'AR-007',  // Interface-based dependencies
  'AR-008',  // Duplicate logic blocks
  'PF-002',  // Event listener cleanup
  'PF-004',  // Array pre-allocation
  'PF-006',  // Off-screen culling
  'SC-002',  // Packet validation
  'NM-003',  // Constant naming
  'NM-004',  // Variable/function naming
  'NM-005',  // Boolean prefixes
  'NM-006',  // Event handler prefixes
  'IM-001',  // Unused imports — needs AST
  'IM-004',  // Barrel re-export side effects
  'IM-005',  // Circular imports — needs dependency graph
  'CF-001',  // Dictionary → Map
  'CF-002',  // Vector → Array
  'CF-003',  // ByteArray → ArrayBuffer
  'CF-005',  // Null return patterns
];
