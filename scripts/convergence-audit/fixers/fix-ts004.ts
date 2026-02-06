#!/usr/bin/env node

/**
 * Auto-fixer for TS-004: Add explicit access modifiers to class members.
 * Adds `public` to class members that lack an access modifier.
 *
 * Safe because: TypeScript defaults to `public`, so this is purely additive.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

function fixFile(filePath: string): { fixed: number; file: string } {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  let fixed = 0;

  let insideClass = false;
  let braceDepth = 0;
  let classStartDepth = 0;

  // Track multi-line strings and template literals
  let inBlockComment = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Handle block comments
    if (inBlockComment) {
      if (trimmed.includes('*/')) inBlockComment = false;
      continue;
    }
    if (trimmed.startsWith('/*')) {
      if (!trimmed.includes('*/')) inBlockComment = true;
      continue;
    }
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue;

    // Track class entry
    if (/\bclass\s+\w+/.test(line) && !insideClass) {
      insideClass = true;
      classStartDepth = braceDepth;
    }

    // Count braces (simple - doesn't handle braces in strings perfectly)
    for (const ch of line) {
      if (ch === '{') braceDepth++;
      if (ch === '}') {
        braceDepth--;
        if (insideClass && braceDepth <= classStartDepth) {
          insideClass = false;
        }
      }
    }

    if (!insideClass) continue;
    if (braceDepth !== classStartDepth + 1) continue;

    // Skip empty lines, decorators, constructors, closing braces
    if (!trimmed) continue;
    if (trimmed.startsWith('@')) continue;
    if (trimmed.startsWith('constructor')) continue;
    if (trimmed.startsWith('{') || trimmed.startsWith('}')) continue;

    // Skip lines already with modifiers
    if (/^(private|protected|public|static|abstract|readonly|override|get |set )/.test(trimmed)) continue;

    // Check if it's a member declaration
    const isMemberDecl =
      /^\w+\s*[:(]/.test(trimmed) ||     // property: type or method(
      /^\w+\s*=/.test(trimmed) ||         // property = value
      /^\w+\s*</.test(trimmed) ||         // generic method<T>(
      /^(?:async\s+)?\w+\s*\(/.test(trimmed); // method() or async method()

    if (isMemberDecl) {
      // Get the indentation
      const indent = line.match(/^(\s*)/)?.[1] || '';
      // Special case: async methods
      if (trimmed.startsWith('async ')) {
        lines[i] = `${indent}public ${trimmed}`;
      } else {
        lines[i] = `${indent}public ${trimmed}`;
      }
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
  console.log(`TS-004: ${totalFixed} membres corrigés dans ${filesChanged} fichiers.`);
}

main();
