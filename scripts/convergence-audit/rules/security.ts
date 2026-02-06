/**
 * Security rule checkers (SC-001 to SC-005)
 * Automated static analysis for security-critical rules.
 */

import type { AuditContext, Violation } from '../types.js';

/** SC-001: No innerHTML without prior sanitization */
export function checkSC001(ctx: AuditContext): Violation[] {
  const violations: Violation[] = [];

  for (let i = 0; i < ctx.lines.length; i++) {
    const line = ctx.lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue;

    if (/\.innerHTML\s*=/.test(line)) {
      // Check if sanitization is happening
      const hasSanitize =
        /sanitize|escape|DOMPurify|purify|encode/i.test(line) ||
        (i > 0 && /sanitize|escape|DOMPurify|purify|encode/i.test(ctx.lines[i - 1]));

      if (!hasSanitize) {
        violations.push({
          ruleId: 'SC-001',
          file: ctx.filePath,
          line: i + 1,
          snippet: trimmed,
          message: '`innerHTML` assignment without sanitization.',
          suggestedFix: 'Use `textContent`, or sanitize input with DOMPurify before assigning to `innerHTML`.',
        });
      }
    }
  }

  return violations;
}

/** SC-003: No sensitive data in localStorage/sessionStorage */
export function checkSC003(ctx: AuditContext): Violation[] {
  const violations: Violation[] = [];
  const storagePattern = /\b(localStorage|sessionStorage)\s*\.\s*(setItem|getItem)\s*\(\s*['"]([^'"]+)['"]/;
  const sensitiveKeys = /token|password|secret|key|auth|credential|session_id/i;

  for (let i = 0; i < ctx.lines.length; i++) {
    const line = ctx.lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue;

    const match = storagePattern.exec(line);
    if (match) {
      const key = match[3];
      if (sensitiveKeys.test(key)) {
        violations.push({
          ruleId: 'SC-003',
          file: ctx.filePath,
          line: i + 1,
          snippet: trimmed,
          message: `Sensitive data key \`${key}\` stored in ${match[1]}.`,
          suggestedFix: 'Use secure, HttpOnly cookies or encrypted storage for sensitive data.',
        });
      }
    }
  }

  return violations;
}

/** SC-004: All WebSocket connections must use wss:// */
export function checkSC004(ctx: AuditContext): Violation[] {
  const violations: Violation[] = [];

  for (let i = 0; i < ctx.lines.length; i++) {
    const line = ctx.lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue;

    // Check for ws:// (non-secure) WebSocket
    if (/['"]ws:\/\//.test(line) || /new\s+WebSocket\s*\(\s*['"]ws:\/\//.test(line)) {
      violations.push({
        ruleId: 'SC-004',
        file: ctx.filePath,
        line: i + 1,
        snippet: trimmed,
        message: 'Insecure WebSocket connection (ws://) detected.',
        suggestedFix: 'Use `wss://` for secure WebSocket connections.',
      });
    }
  }

  return violations;
}

/** SC-005: No blind JSON.parse without try/catch */
export function checkSC005(ctx: AuditContext): Violation[] {
  const violations: Violation[] = [];

  for (let i = 0; i < ctx.lines.length; i++) {
    const line = ctx.lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue;

    if (/\bJSON\.parse\s*\(/.test(line)) {
      // Check if we're inside a try block by looking backwards
      let inTryCatch = false;
      for (let j = i - 1; j >= Math.max(0, i - 20); j--) {
        if (/\btry\s*\{/.test(ctx.lines[j])) {
          inTryCatch = true;
          break;
        }
        // Stop searching if we hit another function or class boundary
        if (/\b(function|class|=>)\b/.test(ctx.lines[j]) && j < i - 1) break;
      }

      if (!inTryCatch) {
        violations.push({
          ruleId: 'SC-005',
          file: ctx.filePath,
          line: i + 1,
          snippet: trimmed,
          message: '`JSON.parse()` used without try/catch wrapper.',
          suggestedFix: 'Wrap `JSON.parse()` in a try/catch block with schema validation.',
        });
      }
    }
  }

  return violations;
}
