#!/usr/bin/env node

/**
 * Convergence Audit Runner — Main orchestrator
 *
 * Usage:
 *   npx tsx scripts/convergence-audit/runner.ts [command] [options]
 *
 * Commands:
 *   audit <path>       Run Layer 2 audit on a file or directory
 *   validate <path>    Run Layer 3 validation gate on a file or directory
 *   converge <path>    Run full convergence loop (audit → report)
 *   prompt <path>      Generate AI-assisted review prompt for manual rules
 *   summary            Show rulebook summary and coverage
 *
 * Options:
 *   --json             Output results as JSON
 *   --max-iterations N Maximum convergence iterations (default: 4)
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { auditFile, auditDirectory, generateManualReviewPrompt } from './auditor.js';
import { validateFile, formatValidationResult, generateValidationPrompt } from './validator.js';
import { formatAuditReport, formatConvergenceReport } from './report.js';
import { RULES, RULEBOOK_VERSION, getAutomatableRules, getManualRules, getRulesByCategory, getRulesBySeverity } from './rulebook.js';
import { RULE_CHECKERS, MANUAL_REVIEW_RULES } from './rules/index.js';
import type { AuditPhaseResult, ConvergenceReport } from './types.js';

function main(): void {
  const args = process.argv.slice(2);
  const command = args[0];
  const targetPath = args[1];
  const flags = new Set(args.slice(2));
  const jsonOutput = flags.has('--json');

  if (!command || command === '--help' || command === '-h') {
    printUsage();
    return;
  }

  switch (command) {
    case 'audit':
      runAudit(targetPath, jsonOutput);
      break;
    case 'validate':
      runValidate(targetPath, jsonOutput);
      break;
    case 'converge':
      runConverge(targetPath, jsonOutput);
      break;
    case 'prompt':
      runPrompt(targetPath);
      break;
    case 'prompt-validate':
      runPromptValidate(targetPath);
      break;
    case 'summary':
      runSummary();
      break;
    default:
      console.error(`Commande inconnue: ${command}`);
      printUsage();
      process.exit(1);
  }
}

function runAudit(targetPath: string | undefined, jsonOutput: boolean): void {
  if (!targetPath) {
    console.error('Erreur: chemin requis pour la commande audit.');
    process.exit(1);
  }

  const resolvedPath = path.resolve(targetPath);
  const stat = fs.statSync(resolvedPath);
  let result: AuditPhaseResult;

  if (stat.isDirectory()) {
    result = auditDirectory(resolvedPath);
  } else {
    result = auditFile(resolvedPath);
  }

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    const description = stat.isDirectory() ? `Répertoire: ${resolvedPath}` : `Fichier: ${resolvedPath}`;
    console.log(formatAuditReport(result, description));
  }

  process.exit(result.totalViolations > 0 ? 1 : 0);
}

function runValidate(targetPath: string | undefined, jsonOutput: boolean): void {
  if (!targetPath) {
    console.error('Erreur: chemin requis pour la commande validate.');
    process.exit(1);
  }

  const resolvedPath = path.resolve(targetPath);
  const stat = fs.statSync(resolvedPath);

  if (stat.isDirectory()) {
    const files = collectTsFiles(resolvedPath);
    let allPassed = true;

    for (const file of files) {
      const result = validateFile(file);
      if (jsonOutput) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(formatValidationResult(result));
      }
      if (!result.passed) allPassed = false;
    }

    process.exit(allPassed ? 0 : 1);
  } else {
    const result = validateFile(resolvedPath);
    if (jsonOutput) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatValidationResult(result));
    }
    process.exit(result.passed ? 0 : 1);
  }
}

function runConverge(targetPath: string | undefined, jsonOutput: boolean): void {
  if (!targetPath) {
    console.error('Erreur: chemin requis pour la commande converge.');
    process.exit(1);
  }

  const resolvedPath = path.resolve(targetPath);
  const maxIterations = 4;

  console.log('═'.repeat(70));
  console.log('  BOUCLE DE CONVERGENCE — Helium Audit System');
  console.log(`  Cible: ${resolvedPath}`);
  console.log(`  Itérations maximales: ${maxIterations}`);
  console.log('═'.repeat(70));
  console.log('');

  const phases: AuditPhaseResult[] = [];
  let previousViolationCount = Infinity;

  for (let iteration = 1; iteration <= maxIterations; iteration++) {
    console.log(`--- Itération ${iteration}/${maxIterations} ---`);
    console.log('');

    const stat = fs.statSync(resolvedPath);
    const result = stat.isDirectory()
      ? auditDirectory(resolvedPath)
      : auditFile(resolvedPath);

    phases.push(result);

    const newViolations = iteration === 1
      ? 0
      : Math.max(0, result.totalViolations - previousViolationCount);

    const fixed = iteration === 1
      ? 0
      : Math.max(0, previousViolationCount - result.totalViolations + newViolations);

    const report: ConvergenceReport = {
      iteration,
      violationsFound: result.totalViolations,
      violationsFixed: fixed,
      newViolationsIntroduced: newViolations,
      remainingViolations: result.totalViolations,
      status: result.totalViolations === 0
        ? 'CONVERGED'
        : newViolations > 0
          ? 'NOT_CONVERGED'
          : 'PARTIAL',
      phases,
    };

    if (jsonOutput) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(formatConvergenceReport(report));
    }

    // Check convergence
    if (result.totalViolations === 0) {
      console.log('✅ CONVERGENCE ATTEINTE — Aucune violation restante.');
      break;
    }

    if (result.totalViolations >= previousViolationCount && iteration > 1) {
      console.log('⚠️  Pas de progrès détecté. Arrêt de la boucle.');
      console.log('    Vérifiez les violations restantes et corrigez-les manuellement.');
      break;
    }

    previousViolationCount = result.totalViolations;

    if (iteration < maxIterations) {
      // Print violations summary for the current iteration
      const description = `Itération ${iteration}`;
      console.log(formatAuditReport(result, description));
      console.log('');
      console.log(`Corrigez les violations ci-dessus, puis relancez l'audit.`);
      console.log('Pour un audit interactif, utilisez: npx tsx scripts/convergence-audit/runner.ts audit <path>');
      break; // Stop and let the user fix issues
    }
  }

  const finalResult = phases[phases.length - 1];
  process.exit(finalResult.totalViolations > 0 ? 1 : 0);
}

function runPrompt(targetPath: string | undefined): void {
  if (!targetPath) {
    console.error('Erreur: chemin requis pour la commande prompt.');
    process.exit(1);
  }

  const resolvedPath = path.resolve(targetPath);
  console.log(generateManualReviewPrompt(resolvedPath));
}

function runPromptValidate(targetPath: string | undefined): void {
  if (!targetPath) {
    console.error('Erreur: chemin requis pour la commande prompt-validate.');
    process.exit(1);
  }

  const resolvedPath = path.resolve(targetPath);
  console.log(generateValidationPrompt(resolvedPath));
}

function runSummary(): void {
  const automatable = getAutomatableRules();
  const manual = getManualRules();

  console.log('═'.repeat(70));
  console.log(`  HELIUM RULEBOOK ${RULEBOOK_VERSION} — Résumé`);
  console.log('═'.repeat(70));
  console.log('');

  console.log(`Règles totales:        ${RULES.length}`);
  console.log(`Règles automatisées:   ${automatable.length} (${RULE_CHECKERS.size} vérificateurs implémentés)`);
  console.log(`Règles manuelles:      ${manual.length} (revue AI/humaine requise)`);
  console.log('');

  console.log('## Par catégorie');
  console.log('');
  const categories = ['TYPESCRIPT', 'ARCHITECTURE', 'PERFORMANCE', 'SECURITY', 'NAMING', 'IMPORTS', 'CONVERSION_FIDELITY'] as const;
  for (const cat of categories) {
    const rules = getRulesByCategory(cat);
    const autoCount = rules.filter((r) => r.automatable).length;
    console.log(`  ${cat.padEnd(22)} ${rules.length} règles (${autoCount} auto, ${rules.length - autoCount} manuelles)`);
  }
  console.log('');

  console.log('## Par sévérité');
  console.log('');
  const severities = ['critical', 'major', 'minor'] as const;
  const labels = { critical: '🔴 Critique', major: '🟡 Majeur', minor: '🟢 Mineur' };
  for (const sev of severities) {
    const rules = getRulesBySeverity(sev);
    console.log(`  ${labels[sev].padEnd(22)} ${rules.length} règles`);
  }
  console.log('');

  console.log('## Règles automatisées (vérificateurs statiques)');
  console.log('');
  for (const [ruleId] of RULE_CHECKERS) {
    const rule = RULES.find((r) => r.id === ruleId);
    if (rule) {
      console.log(`  ✓ ${rule.id}: ${rule.description}`);
    }
  }
  console.log('');

  console.log('## Règles nécessitant une revue manuelle/AI');
  console.log('');
  for (const ruleId of MANUAL_REVIEW_RULES) {
    const rule = RULES.find((r) => r.id === ruleId);
    if (rule) {
      console.log(`  ○ ${rule.id}: ${rule.description}`);
    }
  }
  console.log('');
}

function collectTsFiles(dirPath: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      files.push(...collectTsFiles(fullPath));
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

function printUsage(): void {
  console.log(`
Helium Convergence Audit System — Rulebook ${RULEBOOK_VERSION}

Usage: npx tsx scripts/convergence-audit/runner.ts <command> [path] [options]

Commands:
  audit <path>          Lancer un audit Layer 2 (détection de violations)
  validate <path>       Lancer une validation Layer 3 (PASS/FAIL binaire)
  converge <path>       Lancer la boucle de convergence complète
  prompt <path>         Générer un prompt de revue AI pour les règles manuelles
  prompt-validate <path> Générer un prompt de validation AI (Layer 3)
  summary               Afficher le résumé du Rulebook et la couverture

Options:
  --json                Sortie au format JSON
  --help, -h            Afficher cette aide

Examples:
  npx tsx scripts/convergence-audit/runner.ts audit src/
  npx tsx scripts/convergence-audit/runner.ts validate src/core/Helium.ts
  npx tsx scripts/convergence-audit/runner.ts converge src/habbo/
  npx tsx scripts/convergence-audit/runner.ts prompt src/room/RoomManager.ts
  npx tsx scripts/convergence-audit/runner.ts summary
`);
}

main();
