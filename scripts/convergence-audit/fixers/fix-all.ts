#!/usr/bin/env node

/**
 * Master fixer — runs all automated fixers in sequence.
 * Order matters: some fixers depend on others being run first.
 */

import { execSync } from 'node:child_process';
import * as path from 'node:path';

const FIXERS = [
  { name: 'TS-001', script: 'fix-ts001.ts', desc: 'Replace any → unknown' },
  { name: 'TS-003', script: 'fix-ts003.ts', desc: 'Add cast justification comments' },
  { name: 'TS-004', script: 'fix-ts004.ts', desc: 'Add public access modifiers' },
  { name: 'TS-007', script: 'fix-ts007.ts', desc: 'Replace console → Logger' },
  { name: 'TS-010', script: 'fix-ts010.ts', desc: 'Convert enum → const enum' },
  { name: 'IM-002', script: 'fix-im002.ts', desc: 'Replace deep relative imports' },
  { name: 'IM-003', script: 'fix-im003.ts', desc: 'Reorder imports' },
  { name: 'SC-004', script: 'fix-sc004.ts', desc: 'Replace ws:// → wss://' },
  { name: 'SC-005', script: 'fix-sc005.ts', desc: 'Wrap JSON.parse in try/catch' },
];

function main(): void {
  const target = process.argv[2] || 'src/';
  const fixersDir = path.dirname(new URL(import.meta.url).pathname);

  console.log('═'.repeat(70));
  console.log('  CORRECTION AUTOMATIQUE — Helium Convergence Audit');
  console.log(`  Cible: ${path.resolve(target)}`);
  console.log(`  Fixers: ${FIXERS.length}`);
  console.log('═'.repeat(70));
  console.log('');

  for (const fixer of FIXERS) {
    console.log(`--- ${fixer.name}: ${fixer.desc} ---`);
    const scriptPath = path.join(fixersDir, fixer.script);

    try {
      const output = execSync(`npx tsx "${scriptPath}" "${target}"`, {
        encoding: 'utf-8',
        cwd: process.cwd(),
        timeout: 120000,
      });
      console.log(output);
    } catch (error: unknown) {
      const err = error as { stdout?: string; stderr?: string };
      if (err.stdout) console.log(err.stdout);
      if (err.stderr) console.error(err.stderr);
      console.error(`  ⚠️  Erreur lors de l'exécution de ${fixer.name}`);
      console.log('');
    }
  }

  console.log('═'.repeat(70));
  console.log('  Corrections terminées. Relancez l\'audit pour vérifier.');
  console.log('  npx tsx scripts/convergence-audit/runner.ts audit src/');
  console.log('═'.repeat(70));
}

main();
