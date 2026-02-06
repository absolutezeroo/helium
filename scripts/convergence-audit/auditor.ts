/**
 * LAYER 2 — Iterative Audit Loop
 *
 * Scans files against the Helium Rulebook using automated rule checkers.
 * Produces structured audit results that can be fed into the convergence loop.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import type { AuditContext, AuditPhaseResult, Violation, Severity } from './types.js';
import { RULE_CHECKERS, MANUAL_REVIEW_RULES } from './rules/index.js';
import { RULES, getRuleById } from './rulebook.js';

export function createAuditContext(filePath: string): AuditContext {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  return { filePath, content, lines };
}

export function auditFile(filePath: string): AuditPhaseResult {
  const ctx = createAuditContext(filePath);
  const violations: Violation[] = [];

  for (const [ruleId, checker] of RULE_CHECKERS) {
    const ruleViolations = checker(ctx);
    violations.push(...ruleViolations);
  }

  return classifyViolations(violations);
}

export function auditFiles(filePaths: string[]): AuditPhaseResult {
  const allViolations: Violation[] = [];

  for (const filePath of filePaths) {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) continue;
    if (!fs.existsSync(filePath)) continue;

    const ctx = createAuditContext(filePath);
    for (const [_ruleId, checker] of RULE_CHECKERS) {
      const violations = checker(ctx);
      allViolations.push(...violations);
    }
  }

  return classifyViolations(allViolations);
}

export function auditDirectory(dirPath: string, recursive: boolean = true): AuditPhaseResult {
  const files = collectTypeScriptFiles(dirPath, recursive);
  return auditFiles(files);
}

function collectTypeScriptFiles(dirPath: string, recursive: boolean): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dirPath)) return files;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (recursive && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        files.push(...collectTypeScriptFiles(fullPath, recursive));
      }
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }

  return files;
}

function classifyViolations(violations: Violation[]): AuditPhaseResult {
  let critical = 0;
  let major = 0;
  let minor = 0;

  for (const v of violations) {
    const rule = getRuleById(v.ruleId);
    if (!rule) continue;

    switch (rule.severity) {
      case 'critical':
        critical++;
        break;
      case 'major':
        major++;
        break;
      case 'minor':
        minor++;
        break;
    }
  }

  return {
    violations,
    totalViolations: violations.length,
    critical,
    major,
    minor,
  };
}

/**
 * Generate the manual review prompt for rules that can't be automated.
 * This prompt is designed to be used with an AI assistant for Layer 2 review.
 */
export function generateManualReviewPrompt(filePath: string): string {
  const content = fs.readFileSync(filePath, 'utf-8');
  const manualRules = MANUAL_REVIEW_RULES
    .map((id) => getRuleById(id))
    .filter((r): r is NonNullable<typeof r> => r !== undefined)
    .map((r) => `- ${r.id}: ${r.description}`)
    .join('\n');

  return `You are auditing the following file for the Helium project. You are bound EXCLUSIVELY by the Helium Rulebook.

Check this file ONLY against the following rules (automated checks handle the rest):

${manualRules}

## Rules of engagement:
- Each violation maps to EXACTLY ONE rule ID.
- If code does not violate any rule listed above, do NOT flag it.
- If you are unsure, do NOT flag it. Ambiguity favors the code.
- Do NOT suggest improvements beyond these rules.
- Do NOT flag the same code under multiple rules.

## Output format:
For each violation:
| # | Rule ID | Line | Code snippet | Proposed fix |

At the end:
- Total violations: X
- Breakdown: Critical: X | Major: X | Minor: X

If no violations found, output: "No violations found. File is CLEAN."

## File to audit: ${filePath}
\`\`\`typescript
${content}
\`\`\`

The entire report MUST be written in French.`;
}
