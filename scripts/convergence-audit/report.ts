/**
 * Report Generator — French-language audit and convergence reports.
 */

import type { AuditPhaseResult, ConvergenceReport, Violation } from './types.js';
import { getRuleById, RULEBOOK_VERSION } from './rulebook.js';

const SEVERITY_LABELS: Record<string, string> = {
  critical: '🔴 Critique',
  major: '🟡 Majeur',
  minor: '🟢 Mineur',
};

const CATEGORY_LABELS: Record<string, string> = {
  TYPESCRIPT: 'TypeScript',
  ARCHITECTURE: 'Architecture',
  PERFORMANCE: 'Performance',
  SECURITY: 'Sécurité',
  NAMING: 'Nommage',
  IMPORTS: 'Importations',
  CONVERSION_FIDELITY: 'Fidélité de conversion',
};

/**
 * Format a single audit phase result as a French report.
 */
export function formatAuditReport(result: AuditPhaseResult, targetDescription: string): string {
  const lines: string[] = [];

  lines.push('═'.repeat(70));
  lines.push(`  RAPPORT D'AUDIT — Helium Rulebook ${RULEBOOK_VERSION}`);
  lines.push(`  Cible: ${targetDescription}`);
  lines.push(`  Date: ${new Date().toISOString().split('T')[0]}`);
  lines.push('═'.repeat(70));
  lines.push('');

  if (result.totalViolations === 0) {
    lines.push('✅ AUCUNE VIOLATION DÉTECTÉE');
    lines.push('');
    lines.push('Le code est conforme au Rulebook Helium.');
    lines.push('');
    return lines.join('\n');
  }

  // Summary
  lines.push('## Résumé');
  lines.push('');
  lines.push(`Violations totales: ${result.totalViolations}`);
  lines.push(`  ${SEVERITY_LABELS.critical}: ${result.critical}`);
  lines.push(`  ${SEVERITY_LABELS.major}: ${result.major}`);
  lines.push(`  ${SEVERITY_LABELS.minor}: ${result.minor}`);
  lines.push('');

  // Group violations by file
  const byFile = groupBy(result.violations, (v) => v.file);

  lines.push('## Violations par fichier');
  lines.push('');

  for (const [file, violations] of Object.entries(byFile)) {
    lines.push(`### ${file} (${violations.length} violation${violations.length > 1 ? 's' : ''})`);
    lines.push('');
    lines.push('| # | Règle | Ligne | Extrait | Message | Correction proposée |');
    lines.push('|---|-------|-------|---------|---------|---------------------|');

    violations.forEach((v, idx) => {
      const snippet = truncate(v.snippet, 40);
      const fix = v.suggestedFix ? truncate(v.suggestedFix, 40) : '—';
      lines.push(`| ${idx + 1} | ${v.ruleId} | ${v.line} | \`${snippet}\` | ${v.message} | ${fix} |`);
    });
    lines.push('');
  }

  // Group violations by rule
  const byRule = groupBy(result.violations, (v) => v.ruleId);

  lines.push('## Violations par règle');
  lines.push('');
  lines.push('| Règle | Catégorie | Sévérité | Occurrences |');
  lines.push('|-------|-----------|----------|-------------|');

  for (const [ruleId, violations] of Object.entries(byRule)) {
    const rule = getRuleById(ruleId);
    if (!rule) continue;
    const category = CATEGORY_LABELS[rule.category] || rule.category;
    const severity = SEVERITY_LABELS[rule.severity] || rule.severity;
    lines.push(`| ${ruleId} | ${category} | ${severity} | ${violations.length} |`);
  }
  lines.push('');

  return lines.join('\n');
}

/**
 * Format a convergence report as a French report.
 */
export function formatConvergenceReport(report: ConvergenceReport): string {
  const lines: string[] = [];

  lines.push('═'.repeat(70));
  lines.push(`  RAPPORT DE CONVERGENCE — Itération ${report.iteration}`);
  lines.push('═'.repeat(70));
  lines.push('');

  lines.push('## Métriques de convergence');
  lines.push('');
  lines.push(`Violations trouvées:                ${report.violationsFound}`);
  lines.push(`Violations corrigées:               ${report.violationsFixed}`);
  lines.push(`Nouvelles violations introduites:    ${report.newViolationsIntroduced}`);
  lines.push(`Violations restantes:               ${report.remainingViolations}`);
  lines.push('');

  const statusLabel = {
    CONVERGED: '✅ CONVERGÉ (0 restantes)',
    PARTIAL: '⚠️  PARTIEL — des violations persistent',
    NOT_CONVERGED: '❌ NON CONVERGÉ — nouvelles violations introduites',
  }[report.status];

  lines.push(`Statut de convergence: ${statusLabel}`);
  lines.push('');

  // Show iteration history if multiple phases
  if (report.phases.length > 1) {
    lines.push('## Historique des itérations');
    lines.push('');
    lines.push('| Itération | Violations | Critiques | Majeures | Mineures |');
    lines.push('|-----------|-----------|-----------|----------|----------|');

    report.phases.forEach((phase, idx) => {
      lines.push(`| ${idx + 1} | ${phase.totalViolations} | ${phase.critical} | ${phase.major} | ${phase.minor} |`);
    });
    lines.push('');
  }

  return lines.join('\n');
}

function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {
  const groups: Record<string, T[]> = {};
  for (const item of items) {
    const key = keyFn(item);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  }
  return groups;
}

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
}
