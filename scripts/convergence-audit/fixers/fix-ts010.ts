#!/usr/bin/env node

/**
 * Auto-fixer for TS-010: Convert `enum` to `const enum`.
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

    // Match `enum Foo` but not `const enum Foo`
    if (/\benum\s+\w+/.test(lines[i]) && !/\bconst\s+enum\b/.test(lines[i])) {
      const hasRuntimeJustification = /\/\/.*runtime/i.test(lines[i]);
      if (!hasRuntimeJustification) {
        lines[i] = lines[i].replace(/\benum\b/, 'const enum');
        fixed++;
      }
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
  console.log(`TS-010: ${totalFixed} enums convertis en const enum dans ${filesChanged} fichiers.`);
}

main();
