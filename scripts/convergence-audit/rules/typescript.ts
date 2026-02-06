/**
 * TypeScript rule checkers (TS-001 to TS-010)
 * Automated static analysis for TypeScript-specific rules.
 */

import type { AuditContext, Violation } from '../types.js';

/** TS-001: No `any` type */
export function checkTS001(ctx: AuditContext): Violation[] {
  const violations: Violation[] = [];
  const pattern = /\bany\b/;

  for (let i = 0; i < ctx.lines.length; i++) {
    const line = ctx.lines[i];
    const trimmed = line.trim();

    // Skip comments
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue;

    // Match `any` used as a type annotation
    if (pattern.test(line)) {
      // Refine: check if it's actually a type usage, not part of a word like "anyValue"
      const typePatterns = [
        /:\s*any\b/,         // : any
        /\bany\s*\[/,        // any[]
        /\bany\s*>/,         // generic<any>
        /,\s*any\b/,         // , any (in generics)
        /<\s*any\b/,         // <any
        /\bany\s*\|/,        // any |
        /\|\s*any\b/,        // | any
        /\bany\s*&/,         // any &
        /&\s*any\b/,         // & any
        /as\s+any\b/,        // as any
      ];

      const isTypeUsage = typePatterns.some((p) => p.test(line));
      if (isTypeUsage) {
        violations.push({
          ruleId: 'TS-001',
          file: ctx.filePath,
          line: i + 1,
          snippet: trimmed,
          message: 'Usage of `any` type detected. Use `unknown`, generics, or explicit types.',
          suggestedFix: 'Replace `any` with `unknown` or a specific type.',
        });
      }
    }
  }

  return violations;
}

/** TS-003: No `as` casts without justification comment */
export function checkTS003(ctx: AuditContext): Violation[] {
  const violations: Violation[] = [];
  const castPattern = /\bas\s+(?!const\b)\w/;

  for (let i = 0; i < ctx.lines.length; i++) {
    const line = ctx.lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue;

    if (castPattern.test(line)) {
      // Check if there's a justification comment on this line or the previous line
      const hasInlineComment = /\/\/.*(?:cast|external|untyped|pixi|lib)/i.test(line);
      const hasPrevLineComment =
        i > 0 && /\/\/.*(?:cast|external|untyped|pixi|lib)/i.test(ctx.lines[i - 1]);

      if (!hasInlineComment && !hasPrevLineComment) {
        violations.push({
          ruleId: 'TS-003',
          file: ctx.filePath,
          line: i + 1,
          snippet: trimmed,
          message: '`as` cast without justification comment.',
          suggestedFix: 'Add a comment explaining why the cast is necessary, or remove it.',
        });
      }
    }
  }

  return violations;
}

/** TS-004: All class members must have explicit access modifiers */
export function checkTS004(ctx: AuditContext): Violation[] {
  const violations: Violation[] = [];
  let insideClass = false;
  let braceDepth = 0;
  let classStartDepth = 0;

  for (let i = 0; i < ctx.lines.length; i++) {
    const line = ctx.lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue;

    // Track class entry
    if (/\bclass\s+\w+/.test(line)) {
      insideClass = true;
      classStartDepth = braceDepth;
    }

    // Track braces
    for (const ch of line) {
      if (ch === '{') braceDepth++;
      if (ch === '}') {
        braceDepth--;
        if (insideClass && braceDepth <= classStartDepth) {
          insideClass = false;
        }
      }
    }

    if (!insideClass) continue;
    if (braceDepth !== classStartDepth + 1) continue;

    // Check for member declarations without access modifiers
    // Skip empty lines, decorators, constructors
    if (!trimmed || trimmed.startsWith('@') || trimmed.startsWith('constructor')) continue;
    if (trimmed.startsWith('{') || trimmed.startsWith('}')) continue;

    // Skip lines that are already modified, abstract, static, readonly with modifier
    if (/^(private|protected|public|static|abstract|readonly|override|get |set )/.test(trimmed)) continue;

    // Check if it looks like a member declaration (property or method)
    const isMemberDecl =
      /^\w+\s*[:(]/.test(trimmed) || // property: type or method(
      /^\w+\s*=/.test(trimmed) ||     // property = value
      /^\w+\s*</.test(trimmed) ||     // generic method<T>(
      /^(?:async\s+)?\w+\s*\(/.test(trimmed); // method() or async method()

    if (isMemberDecl) {
      violations.push({
        ruleId: 'TS-004',
        file: ctx.filePath,
        line: i + 1,
        snippet: trimmed,
        message: 'Class member lacks explicit access modifier.',
        suggestedFix: 'Add `public`, `private`, or `protected` modifier.',
      });
    }
  }

  return violations;
}

/** TS-007: No console.log/warn/error outside Logger service */
export function checkTS007(ctx: AuditContext): Violation[] {
  const violations: Violation[] = [];
  const consolePattern = /\bconsole\.(log|warn|error|info|debug|trace)\b/;

  // Skip if this file IS the Logger service
  const isLoggerFile = /logger/i.test(ctx.filePath);
  if (isLoggerFile) return violations;

  for (let i = 0; i < ctx.lines.length; i++) {
    const line = ctx.lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue;

    if (consolePattern.test(line)) {
      violations.push({
        ruleId: 'TS-007',
        file: ctx.filePath,
        line: i + 1,
        snippet: trimmed,
        message: 'Direct console usage detected outside Logger service.',
        suggestedFix: 'Use the Logger service instead of direct console calls.',
      });
    }
  }

  return violations;
}

/** TS-009: No non-null assertions unless immediately after a type guard */
export function checkTS009(ctx: AuditContext): Violation[] {
  const violations: Violation[] = [];
  const nonNullPattern = /\w+!/;

  for (let i = 0; i < ctx.lines.length; i++) {
    const line = ctx.lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue;

    // Match non-null assertion operator (! after an identifier, not !== or !=)
    const matches = line.matchAll(/(\w+)!(?!=)\s*[.;\[,)]/g);

    for (const match of matches) {
      // Check if previous line is a type guard
      const prevLine = i > 0 ? ctx.lines[i - 1].trim() : '';
      const isAfterTypeGuard =
        /\bif\s*\(.*\b(typeof|instanceof|in|is)\b/.test(prevLine) ||
        /\bif\s*\(\s*\w+\s*[!=]==?\s*(null|undefined)\s*\)/.test(prevLine) ||
        /\bif\s*\(\s*!\s*\w+\s*\)/.test(prevLine) ||
        /\bif\s*\(\s*\w+\s*\)/.test(prevLine);

      if (!isAfterTypeGuard) {
        violations.push({
          ruleId: 'TS-009',
          file: ctx.filePath,
          line: i + 1,
          snippet: trimmed,
          message: `Non-null assertion on \`${match[1]}\` without preceding type guard.`,
          suggestedFix: 'Add a type guard before using `!` or use optional chaining `?.`.',
        });
      }
    }
  }

  return violations;
}

/** TS-010: Enums must be const enum */
export function checkTS010(ctx: AuditContext): Violation[] {
  const violations: Violation[] = [];

  for (let i = 0; i < ctx.lines.length; i++) {
    const line = ctx.lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue;

    // Match `enum Foo` but not `const enum Foo`
    if (/\benum\s+\w+/.test(line) && !/\bconst\s+enum\b/.test(line)) {
      // Check for comment justifying runtime usage
      const hasJustification = /\/\/.*runtime/i.test(line);
      if (!hasJustification) {
        violations.push({
          ruleId: 'TS-010',
          file: ctx.filePath,
          line: i + 1,
          snippet: trimmed,
          message: 'Non-const enum detected. Use `const enum` unless runtime value is needed.',
          suggestedFix: 'Add `const` keyword before `enum`, or add a `// runtime` comment if runtime value is needed.',
        });
      }
    }
  }

  return violations;
}
