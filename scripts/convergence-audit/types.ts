/**
 * Convergence Audit System — Shared Types
 */

export type RuleCategory =
  | 'TYPESCRIPT'
  | 'ARCHITECTURE'
  | 'PERFORMANCE'
  | 'SECURITY'
  | 'NAMING'
  | 'IMPORTS'
  | 'CONVERSION_FIDELITY';

export type Severity = 'critical' | 'major' | 'minor';

export interface Rule {
  readonly id: string;
  readonly category: RuleCategory;
  readonly severity: Severity;
  readonly description: string;
  readonly automatable: boolean;
}

export interface Violation {
  readonly ruleId: string;
  readonly file: string;
  readonly line: number;
  readonly snippet: string;
  readonly message: string;
  readonly suggestedFix: string | null;
}

export interface AuditPhaseResult {
  readonly violations: Violation[];
  readonly totalViolations: number;
  readonly critical: number;
  readonly major: number;
  readonly minor: number;
}

export interface ConvergenceReport {
  readonly iteration: number;
  readonly violationsFound: number;
  readonly violationsFixed: number;
  readonly newViolationsIntroduced: number;
  readonly remainingViolations: number;
  readonly status: 'CONVERGED' | 'PARTIAL' | 'NOT_CONVERGED';
  readonly phases: AuditPhaseResult[];
}

export interface ValidationResult {
  readonly passed: boolean;
  readonly file: string;
  readonly rulesChecked: number;
  readonly violations: Violation[];
}

export interface AuditContext {
  readonly filePath: string;
  readonly content: string;
  readonly lines: string[];
}
