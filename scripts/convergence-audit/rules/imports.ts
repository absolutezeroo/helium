/**
 * Import rule checkers (IM-002, IM-003)
 * Automated static analysis for import rules.
 */

import type { AuditContext, Violation } from '../types.js';

/** IM-002: No relative paths deeper than ../../ */
export function checkIM002(ctx: AuditContext): Violation[] {
  const violations: Violation[] = [];

  for (let i = 0; i < ctx.lines.length; i++) {
    const line = ctx.lines[i];
    const trimmed = line.trim();

    if (!trimmed.startsWith('import')) continue;

    // Match import paths
    const pathMatch = /['"](\.\.\/.*)['"]/.exec(line);
    if (pathMatch) {
      const importPath = pathMatch[1];
      // Count levels of ../
      const levels = (importPath.match(/\.\.\//g) || []).length;
      if (levels > 2) {
        violations.push({
          ruleId: 'IM-002',
          file: ctx.filePath,
          line: i + 1,
          snippet: trimmed,
          message: `Import path \`${importPath}\` has ${levels} levels of \`../\` (max 2).`,
          suggestedFix: 'Use path aliases (e.g., `@/`, `@core/`, `@habbo/`) instead of deep relative paths.',
        });
      }
    }
  }

  return violations;
}

/** IM-003: Import order: 1) external packages 2) absolute internal 3) relative */
export function checkIM003(ctx: AuditContext): Violation[] {
  const violations: Violation[] = [];

  type ImportKind = 'external' | 'absolute' | 'relative';

  const imports: Array<{ kind: ImportKind; line: number; text: string }> = [];

  for (let i = 0; i < ctx.lines.length; i++) {
    const line = ctx.lines[i];
    const trimmed = line.trim();

    // Match lines that are imports: starts with `import` OR is a multi-line import `} from '...'`
    const isImportLine = trimmed.startsWith('import') || /^}\s*from\s+['"]/.test(trimmed);
    if (!isImportLine) continue;
    // Check for module path
    if (/^import\s+['"]/.test(trimmed) || /from\s+['"]/.test(trimmed)) {
      const pathMatch = /['"]([^'"]+)['"]/.exec(line);
      if (pathMatch) {
        const path = pathMatch[1];
        let kind: ImportKind;

        if (path.startsWith('.')) {
          kind = 'relative';
        } else if (path.startsWith('@/') || path.startsWith('@core/') || path.startsWith('@habbo/') || path.startsWith('@room/') || path.startsWith('@iid/') || path.startsWith('@ui/')) {
          kind = 'absolute';
        } else {
          kind = 'external';
        }

        imports.push({ kind, line: i + 1, text: trimmed });
      }
    }
  }

  // Check ordering: external must come before absolute, absolute before relative
  const kindOrder: Record<ImportKind, number> = { external: 0, absolute: 1, relative: 2 };
  let maxSeenOrder = -1;

  for (const imp of imports) {
    const order = kindOrder[imp.kind];
    if (order < maxSeenOrder) {
      violations.push({
        ruleId: 'IM-003',
        file: ctx.filePath,
        line: imp.line,
        snippet: imp.text,
        message: `Import order violation: \`${imp.kind}\` import after a later-ordered import group.`,
        suggestedFix: 'Reorder imports: 1) external packages 2) absolute internal (@/) 3) relative (./).',
      });
      break; // Report first violation only to avoid noise
    }
    maxSeenOrder = Math.max(maxSeenOrder, order);
  }

  return violations;
}
