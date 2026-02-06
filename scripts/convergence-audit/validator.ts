/**
 * LAYER 3 — Validation Gate
 *
 * Binary PASS/FAIL validator. Does NOT suggest fixes.
 * Use this as the final gate after fixes are applied.
 */

import * as fs from 'node:fs';
import type { ValidationResult, Violation } from './types.js';
import { RULE_CHECKERS } from './rules/index.js';
import { RULES, getRuleById } from './rulebook.js';
import { createAuditContext } from './auditor.js';

/**
 * Validate a single file against all automated rules.
 * Returns PASS if zero violations, FAIL otherwise.
 */
export function validateFile(filePath: string): ValidationResult {
  if (!fs.existsSync(filePath)) {
    return {
      passed: false,
      file: filePath,
      rulesChecked: 0,
      violations: [{
        ruleId: 'SYSTEM',
        file: filePath,
        line: 0,
        snippet: '',
        message: 'File not found.',
        suggestedFix: null,
      }],
    };
  }

  const ctx = createAuditContext(filePath);
  const violations: Violation[] = [];

  for (const [_ruleId, checker] of RULE_CHECKERS) {
    violations.push(...checker(ctx));
  }

  return {
    passed: violations.length === 0,
    file: filePath,
    rulesChecked: RULE_CHECKERS.size,
    violations,
  };
}

/**
 * Validate multiple files. Returns overall PASS only if ALL files pass.
 */
export function validateFiles(filePaths: string[]): ValidationResult[] {
  return filePaths
    .filter((f) => f.endsWith('.ts') || f.endsWith('.tsx'))
    .map((f) => validateFile(f));
}

/**
 * Format validation result in French (as specified by the system).
 */
export function formatValidationResult(result: ValidationResult): string {
  if (result.passed) {
    return [
      '',
      '✅ VALIDATION RÉUSSIE',
      `Fichier: ${result.file}`,
      `Règles vérifiées: ${result.rulesChecked}/${RULES.length}`,
      'Violations: 0',
      'Statut: APPROUVÉ POUR MERGE',
      '',
    ].join('\n');
  }

  const violationRows = result.violations.map((v, idx) => {
    const rule = getRuleById(v.ruleId);
    const desc = rule ? rule.description : v.message;
    return `| ${idx + 1} | ${v.ruleId} | ${v.line} | ${desc} |`;
  });

  return [
    '',
    '❌ VALIDATION ÉCHOUÉE',
    `Fichier: ${result.file}`,
    `Violations trouvées: ${result.violations.length}`,
    '',
    '| # | Rule ID | Ligne | Description |',
    '|---|---------|-------|-------------|',
    ...violationRows,
    '',
    'Statut: BLOQUÉ — corriger et re-soumettre.',
    '',
  ].join('\n');
}

/**
 * Generate the AI-assisted validation prompt for manual rules (Layer 3).
 */
export function generateValidationPrompt(filePath: string): string {
  const content = fs.readFileSync(filePath, 'utf-8');

  return `You are a BINARY VALIDATOR for the Helium project. You are bound EXCLUSIVELY by the Helium Rulebook provided in this conversation.

Your job is NOT to audit, NOT to suggest improvements, NOT to give opinions. Your ONLY job is to answer: does this code PASS or FAIL against the Helium Rulebook?

## PROCESS

1. Read the code.
2. Check every line against every rule in the Rulebook.
3. If ZERO violations are found → output PASS.
4. If ANY violation is found → output FAIL with the list.

## OUTPUT FORMAT

If PASS:
\`\`\`
✅ VALIDATION RÉUSSIE
Fichier: ${filePath}
Règles vérifiées: 42/42
Violations: 0
Statut: APPROUVÉ POUR MERGE
\`\`\`

If FAIL:
\`\`\`
❌ VALIDATION ÉCHOUÉE
Fichier: ${filePath}
Violations trouvées: X

| # | Rule ID | Ligne | Description |
|---|---------|-------|-------------|

Statut: BLOQUÉ — corriger et re-soumettre.
\`\`\`

## STRICT CONSTRAINTS
- You may ONLY flag violations of numbered rules from the Rulebook.
- If you are unsure whether something is a violation → it is NOT a violation.
- No opinions. No suggestions. No "nice to have". Only rule violations.
- If the code is clean, say PASS. Do not manufacture findings.

The entire output MUST be in French.

## Code to validate:
\`\`\`typescript
${content}
\`\`\``;
}
