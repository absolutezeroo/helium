/**
 * Performance rule checkers (PF-001, PF-003, PF-005)
 * Automated static analysis for performance-critical rules.
 */

import type { AuditContext, Violation } from '../types.js';

/** PF-001: No `new` keyword inside update/render/tick functions */
export function checkPF001(ctx: AuditContext): Violation[] {
  const violations: Violation[] = [];
  const hotFunctionPattern = /\b(update|render|tick|draw|animate|onFrame|onTick)\s*\(/;
  let insideHotFunction = false;
  let hotFunctionName = '';
  let braceDepth = 0;
  let hotFunctionDepth = 0;

  for (let i = 0; i < ctx.lines.length; i++) {
    const line = ctx.lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue;

    // Detect hot function entry
    const match = hotFunctionPattern.exec(line);
    if (match && !insideHotFunction) {
      insideHotFunction = true;
      hotFunctionName = match[1];
      hotFunctionDepth = braceDepth;
    }

    // Track braces
    for (const ch of line) {
      if (ch === '{') braceDepth++;
      if (ch === '}') {
        braceDepth--;
        if (insideHotFunction && braceDepth <= hotFunctionDepth) {
          insideHotFunction = false;
        }
      }
    }

    // Check for `new` inside hot function
    if (insideHotFunction && /\bnew\s+\w+/.test(line)) {
      violations.push({
        ruleId: 'PF-001',
        file: ctx.filePath,
        line: i + 1,
        snippet: trimmed,
        message: `\`new\` allocation inside per-frame function \`${hotFunctionName}()\`.`,
        suggestedFix: 'Pre-allocate objects outside the hot path and reuse them.',
      });
    }
  }

  return violations;
}

/** PF-003: No Object.keys/values/entries inside per-frame loops */
export function checkPF003(ctx: AuditContext): Violation[] {
  const violations: Violation[] = [];
  const hotFunctionPattern = /\b(update|render|tick|draw|animate|onFrame|onTick)\s*\(/;
  const objectMethodPattern = /\bObject\.(keys|values|entries)\s*\(/;
  let insideHotFunction = false;
  let braceDepth = 0;
  let hotFunctionDepth = 0;

  for (let i = 0; i < ctx.lines.length; i++) {
    const line = ctx.lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue;

    const match = hotFunctionPattern.exec(line);
    if (match && !insideHotFunction) {
      insideHotFunction = true;
      hotFunctionDepth = braceDepth;
    }

    for (const ch of line) {
      if (ch === '{') braceDepth++;
      if (ch === '}') {
        braceDepth--;
        if (insideHotFunction && braceDepth <= hotFunctionDepth) {
          insideHotFunction = false;
        }
      }
    }

    if (insideHotFunction && objectMethodPattern.test(line)) {
      violations.push({
        ruleId: 'PF-003',
        file: ctx.filePath,
        line: i + 1,
        snippet: trimmed,
        message: '`Object.keys/values/entries` used inside per-frame function.',
        suggestedFix: 'Cache the result outside the hot path, or use a `Map` with `.forEach()`.',
      });
    }
  }

  return violations;
}

/** PF-005: No string concatenation with `+` inside loops */
export function checkPF005(ctx: AuditContext): Violation[] {
  const violations: Violation[] = [];
  let insideLoop = false;
  let braceDepth = 0;
  let loopDepth = 0;

  for (let i = 0; i < ctx.lines.length; i++) {
    const line = ctx.lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue;

    // Detect loop
    if (/\b(for|while|do)\s*[({]/.test(line) && !insideLoop) {
      insideLoop = true;
      loopDepth = braceDepth;
    }

    for (const ch of line) {
      if (ch === '{') braceDepth++;
      if (ch === '}') {
        braceDepth--;
        if (insideLoop && braceDepth <= loopDepth) {
          insideLoop = false;
        }
      }
    }

    // Check for string concat with + inside loops
    if (insideLoop) {
      // Match patterns like: str + "..." or "..." + str or str += "..."
      if (/["'`]\s*\+\s*\w+|\w+\s*\+\s*["'`]|\w+\s*\+=\s*["'`]/.test(line)) {
        violations.push({
          ruleId: 'PF-005',
          file: ctx.filePath,
          line: i + 1,
          snippet: trimmed,
          message: 'String concatenation with `+` inside a loop.',
          suggestedFix: 'Use template literals or collect parts in an array and `join()`.',
        });
      }
    }
  }

  return violations;
}
