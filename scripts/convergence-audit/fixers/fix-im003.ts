#!/usr/bin/env node

/**
 * Auto-fixer for IM-003: Reorder imports (external → absolute → relative).
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

type ImportKind = 'external' | 'absolute' | 'relative';

interface ImportLine {
  kind: ImportKind;
  text: string;
  originalIndex: number;
}

function classifyImport(line: string): ImportKind | null {
  const pathMatch = /['"]([^'"]+)['"]/.exec(line);
  if (!pathMatch) return null;

  const importPath = pathMatch[1];
  if (importPath.startsWith('.')) return 'relative';
  if (importPath.startsWith('@/') || importPath.startsWith('@core/') ||
      importPath.startsWith('@habbo/') || importPath.startsWith('@room/') ||
      importPath.startsWith('@iid/') || importPath.startsWith('@ui/')) return 'absolute';
  return 'external';
}

function fixFile(filePath: string): { fixed: number; file: string } {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Find import block (consecutive import lines at top of file)
  const imports: ImportLine[] = [];
  let importStart = -1;
  let importEnd = -1;
  let lastImportLine = -1;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    // Skip empty lines and comments at start
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      continue;
    }

    if (trimmed.startsWith('import')) {
      if (importStart === -1) importStart = i;
      lastImportLine = i;

      const kind = classifyImport(lines[i]);
      if (kind) {
        imports.push({ kind, text: lines[i], originalIndex: i });
      }
    } else if (importStart !== -1 && lastImportLine !== -1) {
      // Non-import line after imports started — end of import block
      importEnd = lastImportLine;
      break;
    }
  }

  if (imports.length < 2) return { fixed: 0, file: filePath };
  if (importEnd === -1) importEnd = lastImportLine;

  // Check if already properly ordered
  const kindOrder: Record<ImportKind, number> = { external: 0, absolute: 1, relative: 2 };
  let isOrdered = true;
  let maxOrder = -1;
  for (const imp of imports) {
    if (kindOrder[imp.kind] < maxOrder) {
      isOrdered = false;
      break;
    }
    maxOrder = Math.max(maxOrder, kindOrder[imp.kind]);
  }

  if (isOrdered) return { fixed: 0, file: filePath };

  // Sort imports
  const sorted = [...imports].sort((a, b) => {
    const orderDiff = kindOrder[a.kind] - kindOrder[b.kind];
    if (orderDiff !== 0) return orderDiff;
    return a.originalIndex - b.originalIndex; // Preserve original order within group
  });

  // Build new import block with group separators
  const newImportLines: string[] = [];
  let lastKind: ImportKind | null = null;
  for (const imp of sorted) {
    if (lastKind && imp.kind !== lastKind) {
      // Don't add separators — keep it simple
    }
    newImportLines.push(imp.text);
    lastKind = imp.kind;
  }

  // Replace old imports with sorted imports
  // We need to remove the old import lines and insert the new ones
  const nonImportLinesBefore = [];
  const nonImportLinesInBlock = [];

  for (let i = importStart; i <= importEnd; i++) {
    const isImportLine = imports.some((imp) => imp.originalIndex === i);
    if (!isImportLine) {
      nonImportLinesInBlock.push(lines[i]);
    }
  }

  const newLines = [
    ...lines.slice(0, importStart),
    ...newImportLines,
    ...nonImportLinesInBlock,
    ...lines.slice(importEnd + 1),
  ];

  fs.writeFileSync(filePath, newLines.join('\n'));
  return { fixed: 1, file: filePath };
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

  for (const file of files) {
    const result = fixFile(file);
    if (result.fixed > 0) {
      console.log(`  ✓ ${result.file}: imports réordonnés`);
      totalFixed += result.fixed;
    }
  }

  console.log('');
  console.log(`IM-003: ${totalFixed} fichiers corrigés.`);
}

main();
