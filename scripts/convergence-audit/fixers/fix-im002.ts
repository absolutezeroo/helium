#!/usr/bin/env node

/**
 * Auto-fixer for IM-002: Replace deep relative imports (> ../../) with path aliases.
 * Maps known directory patterns to their @/ aliases.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const ALIAS_MAP: Array<{ pattern: RegExp; prefix: string }> = [
  { pattern: /src\/core\//, prefix: '@core/' },
  { pattern: /src\/habbo\//, prefix: '@habbo/' },
  { pattern: /src\/room\//, prefix: '@room/' },
  { pattern: /src\/iid\//, prefix: '@iid/' },
  { pattern: /src\/ui\//, prefix: '@ui/' },
  { pattern: /src\//, prefix: '@/' },
];

function fixFile(filePath: string): { fixed: number; file: string } {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  let fixed = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed.startsWith('import')) continue;

    // Match import paths with deep relative imports
    const pathMatch = /(['"])(\.\.\/.*?)(['"])/.exec(line);
    if (!pathMatch) continue;

    const importPath = pathMatch[2];
    const levels = (importPath.match(/\.\.\//g) || []).length;
    if (levels <= 2) continue;

    // Resolve the absolute path
    const fileDir = path.dirname(filePath);
    const absoluteTarget = path.resolve(fileDir, importPath);

    // Find the matching alias
    for (const { pattern, prefix } of ALIAS_MAP) {
      const match = pattern.exec(absoluteTarget);
      if (match) {
        const afterMatch = absoluteTarget.slice(match.index + match[0].length);
        const newPath = prefix + afterMatch;
        lines[i] = line.replace(pathMatch[0], `${pathMatch[1]}${newPath}${pathMatch[3]}`);
        fixed++;
        break;
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
  console.log(`IM-002: ${totalFixed} imports corrigés dans ${filesChanged} fichiers.`);
}

main();
