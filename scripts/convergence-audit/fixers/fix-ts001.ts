#!/usr/bin/env node

/**
 * Auto-fixer for TS-001: Replace `any` types with `unknown`.
 * Only replaces clear type annotation patterns, not type-adjacent words.
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

    const original = lines[i];

    // Replace : any with : unknown
    lines[i] = lines[i].replace(/:\s*any\b(?!\w)/g, ': unknown');
    // Replace <any> with <unknown>
    lines[i] = lines[i].replace(/<any>/g, '<unknown>');
    // Replace any[] with unknown[]
    lines[i] = lines[i].replace(/\bany\[\]/g, 'unknown[]');
    // Replace as any with as unknown
    lines[i] = lines[i].replace(/\bas\s+any\b/g, 'as unknown');
    // Replace | any with | unknown
    lines[i] = lines[i].replace(/\|\s*any\b/g, '| unknown');
    // Replace any | with unknown |
    lines[i] = lines[i].replace(/\bany\s*\|/g, 'unknown |');

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
  console.log(`TS-001: ${totalFixed} types \`any\` remplacés dans ${filesChanged} fichiers.`);
}

main();
