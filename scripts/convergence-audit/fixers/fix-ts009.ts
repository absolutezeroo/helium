#!/usr/bin/env node

/**
 * Auto-fixer for TS-009: Replace non-null assertions with optional chaining or type guards.
 * Uses optional chaining (`?.`) as the safe default replacement.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

function fixFile(filePath: string): { fixed: number; file: string } {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  let fixed = 0;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue;

    // Check if previous line is a type guard (in which case the assertion is fine)
    const prevLine = i > 0 ? lines[i - 1].trim() : '';
    const isAfterTypeGuard =
      /\bif\s*\(.*\b(typeof|instanceof|in|is)\b/.test(prevLine) ||
      /\bif\s*\(\s*\w+\s*[!=]==?\s*(null|undefined)\s*\)/.test(prevLine) ||
      /\bif\s*\(\s*!\s*\w+\s*\)/.test(prevLine) ||
      /\bif\s*\(\s*\w+\s*\)/.test(prevLine);

    if (isAfterTypeGuard) continue;

    const original = lines[i];

    // Pattern 1: this._foo!.bar → this._foo?.bar (property access)
    lines[i] = lines[i].replace(/(\b\w+(?:\.\w+)*)!\./g, '$1?.');

    // Pattern 2: this._foo![ → this._foo?.[ (bracket access)
    lines[i] = lines[i].replace(/(\b\w+(?:\.\w+)*)!\[/g, '$1?.[');

    if (lines[i] !== original) {
      fixed++;
    }
  }

  if (fixed > 0) {
    fs.writeFileSync(filePath, lines.join('\n'));
  }

  return { fixed, file: filePath };
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

function main(): void {
  const target = process.argv[2] || 'src/';
  const resolvedPath = path.resolve(target);
  const stat = fs.statSync(resolvedPath);

  const files = stat.isDirectory() ? collectTsFiles(resolvedPath) : [resolvedPath];
  let totalFixed = 0;
  let filesChanged = 0;

  for (const file of files) {
    const result = fixFile(file);
    if (result.fixed > 0) {
      console.log(`  ✓ ${result.file}: ${result.fixed} corrections`);
      totalFixed += result.fixed;
      filesChanged++;
    }
  }

  console.log('');
  console.log(`TS-009: ${totalFixed} assertions non-null corrigées dans ${filesChanged} fichiers.`);
}

main();
