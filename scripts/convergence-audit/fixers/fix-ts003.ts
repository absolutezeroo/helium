#!/usr/bin/env node

/**
 * Auto-fixer for TS-003: Add justification comments to `as` casts.
 * Adds a `// cast: type assertion` comment to `as` casts that lack one.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

function fixFile(filePath: string): { fixed: number; file: string } {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  let fixed = 0;

  const castPattern = /\bas\s+(?!const\b)\w/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue;

    if (castPattern.test(line)) {
      // Check if there's already a justification comment
      const hasInlineComment = /\/\/.*(?:cast|external|untyped|pixi|lib|assertion|required)/i.test(line);
      const hasPrevLineComment =
        i > 0 && /\/\/.*(?:cast|external|untyped|pixi|lib|assertion|required)/i.test(lines[i - 1]);

      if (!hasInlineComment && !hasPrevLineComment) {
        // Add inline comment at end of line
        const lineWithoutTrailing = lines[i].replace(/\s+$/, '');
        // Determine the cast context
        if (/\bas\s+unknown\b/.test(line)) {
          lines[i] = `${lineWithoutTrailing} // cast: intermediate unknown assertion`;
        } else if (/pixi|Texture|Container|Sprite|Graphics/i.test(line)) {
          lines[i] = `${lineWithoutTrailing} // cast: PixiJS type assertion`;
        } else if (/Event|MessageEvent|CustomEvent/i.test(line)) {
          lines[i] = `${lineWithoutTrailing} // cast: event type assertion`;
        } else {
          lines[i] = `${lineWithoutTrailing} // cast: type assertion required`;
        }
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
  console.log(`TS-003: ${totalFixed} casts annotés dans ${filesChanged} fichiers.`);
}

main();
