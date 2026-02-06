#!/usr/bin/env node

/**
 * Auto-fixer for SC-005: Wrap JSON.parse() calls in try/catch.
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

    if (/\bJSON\.parse\s*\(/.test(lines[i])) {
      // Check if we're already inside a try block
      let inTryCatch = false;
      for (let j = i - 1; j >= Math.max(0, i - 20); j--) {
        if (/\btry\s*\{/.test(lines[j])) {
          inTryCatch = true;
          break;
        }
        if (/\b(function|class|=>)\b/.test(lines[j]) && j < i - 1) break;
      }

      if (!inTryCatch) {
        const indent = lines[i].match(/^(\s*)/)?.[1] || '';
        const originalLine = lines[i];

        // Wrap in try/catch
        lines[i] = [
          `${indent}try {`,
          `  ${originalLine}`,
          `${indent}} catch (_parseError: unknown) {`,
          `${indent}  // SC-005: JSON.parse validation`,
          `${indent}  throw new Error(\`Invalid JSON: \${(_parseError as Error).message}\`);`,
          `${indent}}`,
        ].join('\n');
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
  console.log(`SC-005: ${totalFixed} appels JSON.parse protégés dans ${filesChanged} fichiers.`);
}

main();
