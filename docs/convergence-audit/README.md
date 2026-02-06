# Convergence Audit System

> Ensures code audits CONVERGE to a stable, accepted state instead of endlessly finding new issues.

## The Problem

Running the same audit multiple times produces different results because:
- AI interprets rules slightly differently each time
- Subjective findings have no objective boundary
- Each fix can introduce new findings in other areas

## The Solution: 3-Layer System

```
Layer 1: Rulebook       → Immutable truth (42 rules, no more, no less)
Layer 2: Iterative Audit → Detect violations, propose fixes, self-validate
Layer 3: Validation Gate → Binary PASS/FAIL (no suggestions, no opinions)
```

## Quick Start

```bash
# Install tsx if not already available
npm install -D tsx

# View rulebook summary and coverage
npx tsx scripts/convergence-audit/runner.ts summary

# Audit a single file
npx tsx scripts/convergence-audit/runner.ts audit src/Helium.ts

# Audit an entire directory
npx tsx scripts/convergence-audit/runner.ts audit src/core/

# Validate a file (PASS/FAIL only)
npx tsx scripts/convergence-audit/runner.ts validate src/Helium.ts

# Run convergence loop
npx tsx scripts/convergence-audit/runner.ts converge src/habbo/

# Generate AI review prompt for manual rules
npx tsx scripts/convergence-audit/runner.ts prompt src/room/RoomManager.ts

# JSON output for CI integration
npx tsx scripts/convergence-audit/runner.ts audit src/ --json
```

## npm Scripts

```bash
npm run audit              # Audit entire src/ directory
npm run audit:validate     # Validate entire src/ directory
npm run audit:summary      # Show rulebook summary
```

## Workflow

```
┌──────────────────────────────────┐
│  1. Rulebook loaded as context   │
│     (docs/convergence-audit/     │
│      rulebook.md)                │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│  2. Run automated audit          │◄──────┐
│     (Layer 2 — static checks)   │       │
│     → 22 automated rules        │       │
│     → French violation report   │       │
└──────────────┬───────────────────┘       │
               │                           │
               ▼                           │
┌──────────────────────────────────┐       │
│  3. Fix violations               │       │
│     (Developer or AI-assisted)   │       │
└──────────────┬───────────────────┘       │
               │                           │
               ▼                           │
┌──────────────────────────────────┐       │
│  4. Run validation gate          │       │
│     (Layer 3 — PASS/FAIL)       │       │
└──────────────┬───────────────────┘       │
               │                           │
          ┌────┴────┐                      │
          │         │                      │
        PASS      FAIL ───────────────────►┘
          │
          ▼
┌──────────────────────────────────┐
│  ✅ Code approved for merge      │
└──────────────────────────────────┘
```

Expected convergence: 2-3 iterations max for most files.

## Rule Coverage

| Category           | Total | Automated | Manual |
|--------------------|-------|-----------|--------|
| TypeScript         | 10    | 6         | 4      |
| Architecture       | 8     | 2         | 6      |
| Performance        | 6     | 3         | 3      |
| Security           | 5     | 4         | 1      |
| Naming             | 8     | 4         | 4      |
| Imports            | 5     | 2         | 3      |
| Conversion Fidelity| 5     | 1         | 4      |
| **Total**          | **42**| **22**    | **20** |

For rules requiring manual/AI review, use the `prompt` command to generate
a focused review prompt that can be given to an AI assistant.

## Maintaining the Rulebook

The rulebook is a LIVING DOCUMENT at `docs/convergence-audit/rulebook.md`.
The structured data is at `scripts/convergence-audit/rulebook.ts`.

Update it when:
- A rule is too strict or too lenient
- A recurring issue is not covered by existing rules
- A rule is ambiguous and causes inconsistent audits

Version the rulebook (v1.0, v1.1, etc.) to track which rules were active
when code was approved. Never exceed ~50 rules total.

## Architecture

```
scripts/convergence-audit/
├── runner.ts              # CLI orchestrator (entry point)
├── auditor.ts             # Layer 2 — iterative audit engine
├── validator.ts           # Layer 3 — binary validation gate
├── report.ts              # French report generator
├── rulebook.ts            # Structured rule definitions
├── types.ts               # Shared TypeScript types
└── rules/                 # Individual rule checkers
    ├── index.ts            # Rule checker registry
    ├── typescript.ts       # TS-001 to TS-010
    ├── architecture.ts     # AR-001 to AR-008
    ├── performance.ts      # PF-001 to PF-006
    ├── security.ts         # SC-001 to SC-005
    ├── naming.ts           # NM-001 to NM-008
    ├── imports.ts          # IM-001 to IM-005
    └── conversion.ts       # CF-001 to CF-005

docs/convergence-audit/
├── README.md               # This file
└── rulebook.md             # Human-readable Rulebook v1.0
```
