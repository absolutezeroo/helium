#!/usr/bin/env node

/**
 * Auto-fixer for NM-002: Add `I` prefix to interfaces.
 * Renames the interface declaration AND all references across the codebase.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

// Skip interfaces that are false positives or internal to function signatures
const SKIP_NAMES = new Set(['on', 'registration']);

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

function findInterfacesToRename(files: string[]): Map<string, string[]> {
  const interfaces = new Map<string, string[]>(); // name → files where declared

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue;

      const match = /\binterface\s+([A-Za-z_$]\w*)/.exec(line);
      if (match) {
        const name = match[1];
        // Skip if already prefixed with I (and second char is uppercase)
        if (name.startsWith('I') && name.length > 1 && name[1] === name[1].toUpperCase()) continue;
        if (SKIP_NAMES.has(name)) continue;

        if (!interfaces.has(name)) {
          interfaces.set(name, []);
        }
        interfaces.get(name)!.push(file);
      }
    }
  }

  return interfaces;
}

function renameInFile(filePath: string, oldName: string, newName: string): boolean {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Use word boundary replacement to avoid partial matches
  const pattern = new RegExp(`\\b${oldName}\\b`, 'g');

  // Check if file contains the name at all
  if (!pattern.test(content)) return false;

  // Reset regex state
  pattern.lastIndex = 0;

  const newContent = content.replace(pattern, (match, offset) => {
    // Don't replace inside strings (very rough check)
    const before = content.slice(Math.max(0, offset - 50), offset);
    const quoteCount = (before.match(/['"]/g) || []).length;
    if (quoteCount % 2 !== 0) return match; // Inside a string

    return newName;
  });

  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
    return true;
  }

  return false;
}

function main(): void {
  const target = process.argv[2] || 'src/';
  const resolvedPath = path.resolve(target);
  const files = collectTsFiles(resolvedPath);

  console.log(`Scanning ${files.length} files for interfaces to rename...`);
  const interfaces = findInterfacesToRename(files);
  console.log(`Found ${interfaces.size} interfaces to rename.`);
  console.log('');

  let totalRenamed = 0;
  let totalFilesChanged = 0;
  const changedFiles = new Set<string>();

  // Sort by name length descending to avoid partial replacements
  // (e.g., rename "FurniGridItem" before "FurniGrid" if both existed)
  const sorted = [...interfaces.entries()].sort((a, b) => b[0].length - a[0].length);

  for (const [oldName, _declFiles] of sorted) {
    const newName = `I${oldName}`;
    let filesChanged = 0;

    for (const file of files) {
      const changed = renameInFile(file, oldName, newName);
      if (changed) {
        filesChanged++;
        changedFiles.add(file);
      }
    }

    if (filesChanged > 0) {
      console.log(`  ✓ ${oldName} → ${newName} (${filesChanged} fichiers)`);
      totalRenamed++;
    }
  }

  totalFilesChanged = changedFiles.size;
  console.log('');
  console.log(`NM-002: ${totalRenamed} interfaces renommées dans ${totalFilesChanged} fichiers.`);
}

main();
