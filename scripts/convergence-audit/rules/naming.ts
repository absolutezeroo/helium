/**
 * Naming rule checkers (NM-001, NM-002, NM-007, NM-008)
 * Automated static analysis for naming convention rules.
 */

import type { AuditContext, Violation } from '../types.js';

/** NM-001: Classes use PascalCase */
export function checkNM001(ctx: AuditContext): Violation[] {
  const violations: Violation[] = [];

  for (let i = 0; i < ctx.lines.length; i++) {
    const line = ctx.lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue;

    const match = /^\s*(?:export\s+)?(?:abstract\s+)?class\s+([A-Za-z_$]\w*)/.exec(line);
    if (match) {
      const name = match[1];
      // PascalCase: starts with uppercase, no underscores (except leading _), no all-caps
      if (!/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
        violations.push({
          ruleId: 'NM-001',
          file: ctx.filePath,
          line: i + 1,
          snippet: trimmed,
          message: `Class name \`${name}\` is not PascalCase.`,
          suggestedFix: `Rename to PascalCase (e.g., \`${name.charAt(0).toUpperCase()}${name.slice(1)}\`).`,
        });
      }
    }
  }

  return violations;
}

/** NM-002: Interfaces are prefixed with I */
export function checkNM002(ctx: AuditContext): Violation[] {
  const violations: Violation[] = [];

  for (let i = 0; i < ctx.lines.length; i++) {
    const line = ctx.lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue;

    // Only match actual interface declarations, not the word "interface" in strings/errors
    const match = /^\s*(?:export\s+)?interface\s+([A-Za-z_$]\w*)/.exec(line);
    if (match) {
      const name = match[1];
      if (!name.startsWith('I') || (name.length > 1 && name[1] !== name[1].toUpperCase())) {
        violations.push({
          ruleId: 'NM-002',
          file: ctx.filePath,
          line: i + 1,
          snippet: trimmed,
          message: `Interface \`${name}\` is not prefixed with \`I\`.`,
          suggestedFix: `Rename to \`I${name}\`.`,
        });
      }
    }
  }

  return violations;
}

/** NM-007: No obfuscated names (_SafeStr_*, _local_*, single letters) */
export function checkNM007(ctx: AuditContext): Violation[] {
  const violations: Violation[] = [];
  const obfuscatedPatterns = [
    /_SafeStr_\w+/,
    /_local_\d+/,
    /\b_arg\d+\b/,
  ];

  for (let i = 0; i < ctx.lines.length; i++) {
    const line = ctx.lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue;

    for (const pattern of obfuscatedPatterns) {
      const match = pattern.exec(line);
      if (match) {
        violations.push({
          ruleId: 'NM-007',
          file: ctx.filePath,
          line: i + 1,
          snippet: trimmed,
          message: `Obfuscated name \`${match[0]}\` found.`,
          suggestedFix: 'Replace with a descriptive name.',
        });
        break; // One violation per line for this rule
      }
    }
  }

  return violations;
}

/** NM-008: Enum values use UPPER_SNAKE_CASE */
export function checkNM008(ctx: AuditContext): Violation[] {
  const violations: Violation[] = [];
  let insideEnum = false;
  let braceDepth = 0;
  let enumDepth = 0;

  for (let i = 0; i < ctx.lines.length; i++) {
    const line = ctx.lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue;

    if (/\benum\s+\w+/.test(line)) {
      insideEnum = true;
      enumDepth = braceDepth;
    }

    for (const ch of line) {
      if (ch === '{') braceDepth++;
      if (ch === '}') {
        braceDepth--;
        if (insideEnum && braceDepth <= enumDepth) {
          insideEnum = false;
        }
      }
    }

    if (insideEnum && braceDepth > enumDepth) {
      // Check enum value names
      const valueMatch = /^\s*(\w+)\s*[=,]/.exec(line);
      if (valueMatch) {
        const valueName = valueMatch[1];
        if (!/^[A-Z][A-Z0-9_]*$/.test(valueName)) {
          violations.push({
            ruleId: 'NM-008',
            file: ctx.filePath,
            line: i + 1,
            snippet: trimmed,
            message: `Enum value \`${valueName}\` is not UPPER_SNAKE_CASE.`,
            suggestedFix: `Rename to \`${valueName.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase()}\`.`,
          });
        }
      }
    }
  }

  return violations;
}
