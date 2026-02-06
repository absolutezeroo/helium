/**
 * Conversion Fidelity rule checkers (CF-004)
 * Automated static analysis for AS3→TS conversion rules.
 */

import type { AuditContext, Violation } from '../types.js';

/** CF-004: AS3 getTimer() must be converted to performance.now() */
export function checkCF004(ctx: AuditContext): Violation[] {
  const violations: Violation[] = [];

  for (let i = 0; i < ctx.lines.length; i++) {
    const line = ctx.lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue;

    if (/\bgetTimer\s*\(/.test(line)) {
      violations.push({
        ruleId: 'CF-004',
        file: ctx.filePath,
        line: i + 1,
        snippet: trimmed,
        message: 'AS3 `getTimer()` call found — must use `performance.now()` in TypeScript.',
        suggestedFix: 'Replace `getTimer()` with `performance.now()`.',
      });
    }

    // Also check for Date.now() used where performance.now() would be more appropriate
    // (in timing/animation contexts)
    if (/\bDate\.now\(\)/.test(line) && /timer|elapsed|delta|frame|tick|anim/i.test(line)) {
      violations.push({
        ruleId: 'CF-004',
        file: ctx.filePath,
        line: i + 1,
        snippet: trimmed,
        message: '`Date.now()` used in timing context — prefer `performance.now()` for high-resolution timing.',
        suggestedFix: 'Replace `Date.now()` with `performance.now()` for timing operations.',
      });
    }
  }

  return violations;
}
