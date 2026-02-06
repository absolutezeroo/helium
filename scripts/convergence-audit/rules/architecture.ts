/**
 * Architecture rule checkers (AR-001 to AR-008)
 * Automated static analysis for architecture rules.
 */

import type { AuditContext, Violation } from '../types.js';

/** AR-001: No class exceeds 300 lines (excluding imports and type definitions) */
export function checkAR001(ctx: AuditContext): Violation[] {
  const violations: Violation[] = [];

  let classStartLine = -1;
  let className = '';
  let braceDepth = 0;
  let classDepth = 0;
  let classBodyLines = 0;
  let inImports = true;

  for (let i = 0; i < ctx.lines.length; i++) {
    const line = ctx.lines[i];
    const trimmed = line.trim();

    // Track when we're past the imports section
    if (inImports) {
      if (trimmed.startsWith('import ') || trimmed === '' || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
        continue;
      }
      inImports = false;
    }

    // Detect class declaration
    const classMatch = /\bclass\s+(\w+)/.exec(line);
    if (classMatch && classStartLine === -1) {
      classStartLine = i + 1;
      className = classMatch[1];
      classDepth = braceDepth;
      classBodyLines = 0;
    }

    // Count braces
    for (const ch of line) {
      if (ch === '{') braceDepth++;
      if (ch === '}') {
        braceDepth--;
        if (classStartLine !== -1 && braceDepth <= classDepth) {
          // Class ended
          if (classBodyLines > 300) {
            violations.push({
              ruleId: 'AR-001',
              file: ctx.filePath,
              line: classStartLine,
              snippet: `class ${className} (${classBodyLines} lines)`,
              message: `Class \`${className}\` exceeds 300 lines (${classBodyLines} lines).`,
              suggestedFix: 'Break the class into smaller, focused classes.',
            });
          }
          classStartLine = -1;
          className = '';
          classBodyLines = 0;
        }
      }
    }

    // Count lines inside class body (excluding type definitions and empty lines)
    if (classStartLine !== -1 && braceDepth > classDepth) {
      if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('*') && !/^\s*(type|interface)\s/.test(trimmed)) {
        classBodyLines++;
      }
    }
  }

  return violations;
}

/** AR-004: Renderer layer must not import from network layer (and vice versa) */
export function checkAR004(ctx: AuditContext): Violation[] {
  const violations: Violation[] = [];

  const isRendererFile =
    ctx.filePath.includes('/renderer/') ||
    ctx.filePath.includes('/room/renderer/') ||
    ctx.filePath.includes('/object/visualization/');

  const isNetworkFile =
    ctx.filePath.includes('/communication/') ||
    ctx.filePath.includes('/messages/') ||
    ctx.filePath.includes('/connection/');

  for (let i = 0; i < ctx.lines.length; i++) {
    const line = ctx.lines[i];
    if (!line.trim().startsWith('import')) continue;

    if (isRendererFile) {
      if (/['"].*\/(communication|messages|connection)\//.test(line)) {
        violations.push({
          ruleId: 'AR-004',
          file: ctx.filePath,
          line: i + 1,
          snippet: line.trim(),
          message: 'Renderer layer importing from network layer.',
          suggestedFix: 'Use events/observables for cross-layer communication.',
        });
      }
    }

    if (isNetworkFile) {
      if (/['"].*\/(renderer|visualization)\//.test(line)) {
        violations.push({
          ruleId: 'AR-004',
          file: ctx.filePath,
          line: i + 1,
          snippet: line.trim(),
          message: 'Network layer importing from renderer layer.',
          suggestedFix: 'Use events/observables for cross-layer communication.',
        });
      }
    }
  }

  return violations;
}
