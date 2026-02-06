#!/usr/bin/env node

/**
 * Auto-fixer for TS-007: Replace console.log/warn/error with Logger calls.
 * Assumes a Logger class exists. Creates import if needed.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const CONSOLE_PATTERN = /\bconsole\.(log|warn|error|info|debug|trace)\b/;

function fixFile(filePath: string): { fixed: number; file: string } {
  // Skip Logger files themselves
  if (/logger/i.test(filePath)) return { fixed: 0, file: filePath };

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  let fixed = 0;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue;

    if (CONSOLE_PATTERN.test(lines[i])) {
      // Replace console.X with Logger.X
      lines[i] = lines[i]
        .replace(/\bconsole\.log\b/, 'Logger.log')
        .replace(/\bconsole\.warn\b/, 'Logger.warn')
        .replace(/\bconsole\.error\b/, 'Logger.error')
        .replace(/\bconsole\.info\b/, 'Logger.info')
        .replace(/\bconsole\.debug\b/, 'Logger.debug')
        .replace(/\bconsole\.trace\b/, 'Logger.trace');
      fixed++;
    }
  }

  if (fixed > 0) {
    // Check if Logger import already exists
    const hasLoggerImport = lines.some((l) => /import.*Logger/.test(l));
    if (!hasLoggerImport) {
      // Find the last import line to add after it
      let lastImportIdx = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import')) {
          lastImportIdx = i;
        }
      }

      const loggerImport = "import { Logger } from '@core/utils/Logger';";
      if (lastImportIdx >= 0) {
        lines.splice(lastImportIdx + 1, 0, loggerImport);
      } else {
        lines.unshift(loggerImport);
      }
    }

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
  console.log(`TS-007: ${totalFixed} appels console remplacés dans ${filesChanged} fichiers.`);
}

main();
