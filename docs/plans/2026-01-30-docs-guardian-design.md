# Documentation Guardian - Design Document

**Created**: 2026-01-30
**Status**: Approved
**Version**: 1.0.0

---

## Overview

**Documentation Guardian** is an automated maintenance system for the PierceDesk documentation structure. It runs on a schedule and can be triggered manually or by Claude sub-agents to keep documentation organized, properly named, and free of broken links.

### Purpose

- Automatically move `.md` files from `/src` to appropriate locations in `/docs`
- Create missing AGENT.md and README.md files
- Fix naming convention violations
- Repair broken internal links
- Clean up orphaned files in root directory

### Trigger Methods

1. **Scheduled**: Daily at 2 AM UTC
2. **Manual**: Via GitHub Actions UI
3. **Claude Sub-Agent**: Via `Task(docs-guardian, "run maintenance")`

---

## Architecture

### Three-Component System

```
┌─────────────────────────────────────────┐
│   GitHub Actions Workflow               │
│   .github/workflows/docs-maintenance.yml│
│                                         │
│   - Scheduled: Daily 2 AM UTC           │
│   - Manual: workflow_dispatch           │
│   - Runs Node.js script                 │
│   - Creates PR with report              │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│   Maintenance Script                    │
│   scripts/docs-maintenance.js           │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │  Plugin Architecture            │   │
│   │  - SourceFileScannerPlugin      │   │
│   │  - MissingFilesPlugin           │   │
│   │  - NameConventionPlugin         │   │
│   │  - BrokenLinksPlugin            │   │
│   │  - OrphanedRootFilesPlugin      │   │
│   └─────────────────────────────────┘   │
│                                         │
│   - Content analysis categorization     │
│   - Auto-fix capabilities               │
│   - PR description generation           │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│   Claude Sub-Agent                      │
│   .claude/agents/docs-guardian.md       │
│                                         │
│   - Invokable via Task tool             │
│   - Triggers workflow via gh CLI        │
│   - Monitors workflow status            │
│   - Reports results                     │
│   - Supports dry-run mode               │
└─────────────────────────────────────────┘
```

---

## File Categorization Logic

### Content Analysis Algorithm

**Priority Order:**

1. **YAML Frontmatter** (highest priority)
   - Check for `type` field: `design`, `execution`, `as-built`, etc.
   - Directly maps to target directory

2. **Filename Patterns**
   - Prefixes: `INDEX-`, `design-`, `execution-`, `as-built-`, `plan-`, `debug-`, `realign-`
   - Direct mapping to system docs

3. **Content Keywords** (first 50 lines)
   - System keywords: "verification", "test results", "implementation log", "phase", "blocker"
   - User keywords: "getting started", "how to", "user guide", "tutorial", "step-by-step"
   - API keywords: "endpoint", "request", "response", "authentication"
   - Weighted scoring determines category

4. **Fallback**
   - If confidence < 70%: move to `docs/orphaned/`
   - Report in PR for manual review

### Target Locations

**System Documentation** (`docs/system/`):
```
docs/system/
├── design/           # design-* files
├── execution/        # execution-*, verification, test result files
├── as-builts/        # as-built-* files
├── plans/            # plan-* files
├── vision/           # vision, roadmap files
└── roadmap/          # strategic planning
```

**User Documentation** (`docs/user-docs/`):
```
docs/user-docs/
├── features/         # Feature guides, capabilities
├── guides/           # How-to, tutorials, getting started
└── api/              # API reference, endpoint docs
```

**Fallback**:
```
docs/orphaned/        # Ambiguous files requiring manual review
```

### Keyword Definitions

```javascript
const SYSTEM_KEYWORDS = [
  'verification', 'test results', 'implementation', 'phase',
  'blocker', 'risk register', 'index document', 'tracking',
  'frontmatter', 'as-built', 'execution log', 'design doc'
];

const USER_KEYWORDS = [
  'getting started', 'how to', 'user guide', 'tutorial',
  'step-by-step', 'feature guide', 'user journey', 'workflow'
];

const API_KEYWORDS = [
  'endpoint', 'request', 'response', 'authentication',
  'authorization', 'api reference', 'rest api', 'graphql'
];
```

---

## Plugin System

### Base Plugin Interface

```javascript
class Plugin {
  constructor(config) {
    this.name = 'PluginName';
    this.config = config;
  }

  async scan() {
    // Detect issues
    // Return array of findings
  }

  async fix() {
    // Apply fixes
    // Return array of changes
  }

  async report() {
    // Generate PR section
    // Return markdown string
  }
}
```

### Plugin Execution Order

1. **SourceFileScannerPlugin** - Scan `/src` for `.md` files
2. **OrphanedRootFilesPlugin** - Scan root for misplaced files
3. **MissingFilesPlugin** - Create missing AGENT.md, README.md
4. **NameConventionPlugin** - Fix naming violations
5. **BrokenLinksPlugin** - Repair broken links

---

## Plugin Details

### 1. SourceFileScannerPlugin

**Purpose**: Find and categorize `.md` files in `/src`

**Algorithm**:
```javascript
1. Find all .md files in src/ (recursive)
2. For each file:
   a. Read content
   b. Extract YAML frontmatter if present
   c. Analyze first 50 lines
   d. Score against keyword sets
   e. Determine target location
   f. Move file to target
   g. Log move with confidence score
```

**Output**:
- List of moved files with source/target paths
- Confidence scores (HIGH/MEDIUM/LOW)
- Ambiguous files moved to `docs/orphaned/`

### 2. MissingFilesPlugin

**Purpose**: Create missing governance and navigation files

**Files to Create**:

**AGENT.md locations**:
- `docs/system/design/AGENT.md`
- `docs/system/execution/AGENT.md`
- `docs/system/as-builts/AGENT.md`
- `docs/system/plans/AGENT.md`
- `docs/system/vision/AGENT.md`
- `docs/system/roadmap/AGENT.md`
- `docs/user-docs/features/AGENT.md`
- `docs/user-docs/guides/AGENT.md`
- `docs/user-docs/api/AGENT.md`

**AGENT.md Template** (system docs):
```markdown
# AGENT.md - {Directory Name}

**Purpose**: Governance rules for {directory purpose}

**Last Updated**: {date}

## Directory Purpose

{Auto-generated based on parent AGENT.md}

## File Naming Conventions

{Inherited from parent + directory-specific rules}

## Required Frontmatter

```yaml
---
type: "{type}"
status: "planned" | "in-progress" | "complete"
version: "X.Y"
created: "YYYY-MM-DD"
updated: "YYYY-MM-DD"
---
```

## Cross-Referencing

Files in this directory should link to:
- {Related directories}

## Quality Standards

{Inherited from parent AGENT.md}
```

**README.md Template**:
```markdown
# {Directory Name}

{Auto-generated description}

## Contents

{Auto-generated list of files with first heading}

## Related Documentation

- [Parent](../README.md)
- [Sibling Directories](../)
```

### 3. NameConventionPlugin

**Purpose**: Fix naming convention violations

**System Docs Rules** (`docs/system/`):
- Format: `{prefix}-{feature|phase}-{topic}.md`
- Prefixes: `design-`, `execution-`, `as-built-`, `plan-`, `INDEX-`, `debug-`, `realign-`
- Lowercase with dashes
- No spaces, no underscores

**Fixes**:
- Missing prefix in subdirectory: `crm-schema.md` → `design-crm-schema.md` (if in design/)
- Wrong case: `Design-Phase1.md` → `design-phase1.md`
- Wrong separator: `phase1_crm.md` → `design-phase1-crm.md`
- Spaces: `Phase 1 CRM.md` → `design-phase1-crm.md`

**User Docs Rules** (`docs/user-docs/`):
- Format: `{topic}-{subtopic}.md` or `{feature-name}.md`
- Lowercase with dashes
- No technical prefixes
- User-friendly, task-oriented

**Fixes**:
- Wrong case: `Getting-Started.md` → `getting-started.md`
- Spaces: `User Guide.md` → `user-guide.md`
- System prefix: `execution-user-guide.md` → `user-guide.md`

### 4. BrokenLinksPlugin

**Purpose**: Detect and fix broken internal links

**Process**:
1. Use `markdown-link-check` to scan all `.md` files
2. Identify broken internal links (relative paths)
3. Auto-fix common patterns:
   - Old structure: `../../_sys_documents/file.md` → `../system/file.md`
   - Missing files: Search for moved file, update link
   - Case sensitivity: Fix case mismatches
4. Report external link failures for manual review

**Link Repair Rules**:
```javascript
// Old structure → New structure
'_sys_documents/design/' → 'system/design/'
'_sys_documents/execution/' → 'system/execution/'
'_sys_documents/as-builts/' → 'system/as-builts/'

// User docs relocation
'docs/architecture/' → 'docs/user-docs/architecture/' (if user-facing)
'docs/features/' → 'docs/user-docs/features/'
'docs/guides/' → 'docs/user-docs/guides/'
'docs/api/' → 'docs/user-docs/api/'
```

### 5. OrphanedRootFilesPlugin

**Purpose**: Clean up `.md` files in repository root

**Allowed Files** (not moved):
- `README.md`
- `CLAUDE.md`
- `LICENSE.md`
- `CHANGELOG.md`
- `CONTRIBUTING.md`

**Process**:
1. Find all `.md` files in root directory
2. Exclude allowed files
3. Categorize using same algorithm as SourceFileScannerPlugin
4. Move to appropriate location in `/docs`
5. Report moves in PR

---

## GitHub Actions Workflow

### Workflow File: `.github/workflows/docs-maintenance.yml`

```yaml
name: Documentation Maintenance

on:
  # Daily at 2 AM UTC
  schedule:
    - cron: '0 2 * * *'

  # Manual trigger + Claude sub-agent trigger
  workflow_dispatch:
    inputs:
      dry_run:
        description: 'Dry run (no changes)'
        required: false
        default: 'false'
        type: boolean

permissions:
  contents: write
  pull-requests: write

jobs:
  maintain-docs:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: |
          npm ci --legacy-peer-deps
          npm install -g markdown-link-check

      - name: Run maintenance script
        id: maintenance
        run: |
          if [ "${{ inputs.dry_run }}" == "true" ]; then
            node scripts/docs-maintenance.js --dry-run
          else
            node scripts/docs-maintenance.js
          fi
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Create Pull Request
        if: steps.maintenance.outputs.has_changes == 'true'
        uses: peter-evans/create-pull-request@v6
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          commit-message: |
            docs: automated documentation maintenance

            Co-Authored-By: Documentation Guardian <noreply@piercedesk.ai>
          branch: docs/maintenance-${{ github.run_id }}
          title: '📚 Automated Documentation Maintenance'
          body-path: .maintenance-report.md
          labels: documentation, automated
          assignees: ${{ github.actor }}
```

### PR Report Format

The script generates `.maintenance-report.md`:

```markdown
## 📚 Documentation Maintenance Report

**Run Date**: {timestamp}
**Triggered By**: schedule | manual | claude-agent

---

### 📦 Files Moved from /src

| Original Path | New Path | Category | Confidence |
|--------------|----------|----------|------------|
| {rows} | {rows} | {rows} | HIGH/MEDIUM/LOW |

**Total moved**: {count} files

---

### ✨ Files Created

#### AGENT.md Files
- {list}

#### README.md Files
- {list}

**Total created**: {count} files

---

### 🔧 Files Renamed

| Old Name | New Name | Reason |
|----------|----------|--------|
| {rows} | {rows} | Naming convention |

**Total renamed**: {count} files

---

### 🔗 Broken Links Fixed

| File | Old Link | New Link |
|------|----------|----------|
| {rows} | {rows} | {rows} |

**Total fixed**: {count} links

---

### ⚠️ Manual Review Required

#### Ambiguous Files (moved to docs/orphaned/)
- {list with reason}

#### Broken External Links
- {list with file:line}

---

### 📊 Summary

- ✅ Moved from /src: {count} files
- ✅ Created missing: {count} files
- ✅ Renamed: {count} files
- ✅ Fixed links: {count} links
- ⚠️ Manual review: {count} items
```

---

## Claude Sub-Agent

### Agent Definition: `.claude/agents/docs-guardian.md`

```markdown
---
name: docs-guardian
description: Documentation maintenance agent - triggers GitHub workflow
trigger: manual
version: 1.0.0
---

# Documentation Guardian Agent

Triggers automated documentation maintenance and reports results.

## Usage

Task(docs-guardian, "run maintenance")
Task(docs-guardian, "run maintenance --dry-run")

## Capabilities

1. Trigger GitHub Actions workflow
2. Monitor workflow execution
3. Report results and PR link
4. Support dry-run mode

## Implementation

1. Check gh CLI authentication
2. Trigger workflow via gh CLI
3. Poll workflow status
4. Get PR link when complete
5. Report to user
```

### Bash Helper Script

**Location**: `.claude/scripts/run-docs-maintenance.sh`

```bash
#!/bin/bash

# Simple wrapper for triggering docs maintenance

MODE="${1:-normal}"

case "$MODE" in
  --dry-run)
    gh workflow run docs-maintenance.yml -f dry_run=true
    ;;
  --watch)
    gh workflow run docs-maintenance.yml
    echo "Waiting for workflow to start..."
    sleep 5
    gh run watch
    ;;
  *)
    gh workflow run docs-maintenance.yml
    echo "✅ Workflow triggered"
    ;;
esac
```

---

## Implementation Plan

### Phase 1: Core Infrastructure (2 days)

**Tasks**:
1. Create GitHub Actions workflow file
2. Create plugin architecture base
3. Implement SourceFileScannerPlugin with content analysis
4. Test file categorization logic

**Files**:
- `.github/workflows/docs-maintenance.yml`
- `scripts/docs-maintenance.js`
- `scripts/plugins/base-plugin.js`
- `scripts/plugins/source-file-scanner-plugin.js`

**Verification**:
```bash
# Test categorization
node scripts/test-categorization.js

# Dry run
node scripts/docs-maintenance.js --dry-run
```

### Phase 2: Auto-Fix Plugins (2 days)

**Tasks**:
5. Implement MissingFilesPlugin
6. Implement NameConventionPlugin
7. Implement BrokenLinksPlugin
8. Implement OrphanedRootFilesPlugin

**Files**:
- `scripts/plugins/missing-files-plugin.js`
- `scripts/plugins/name-convention-plugin.js`
- `scripts/plugins/broken-links-plugin.js`
- `scripts/plugins/orphaned-root-files-plugin.js`

**Verification**:
```bash
# Run each plugin individually
node scripts/test-plugin.js MissingFilesPlugin
node scripts/test-plugin.js NameConventionPlugin
node scripts/test-plugin.js BrokenLinksPlugin
node scripts/test-plugin.js OrphanedRootFilesPlugin
```

### Phase 3: Integration (1 day)

**Tasks**:
9. Create PR generation and reporting
10. Create Claude sub-agent definition
11. Create helper bash script
12. Write tests for categorization logic

**Files**:
- `scripts/lib/report-generator.js`
- `.claude/agents/docs-guardian.md`
- `.claude/scripts/run-docs-maintenance.sh`
- `scripts/test/categorization.test.js`

**Verification**:
```bash
# Full workflow test
node scripts/docs-maintenance.js --dry-run

# Test report generation
node scripts/test-report-generation.js

# Test sub-agent
Task(docs-guardian, "run maintenance --dry-run")
```

### Phase 4: Documentation & Testing (1 day)

**Tasks**:
13. Document usage in CLAUDE.md
14. Create as-built documentation
15. Test full workflow end-to-end
16. Test dry-run mode

**Files**:
- `CLAUDE.md` (update)
- `docs/system/as-builts/as-built-docs-guardian.md`

**Verification**:
```bash
# Trigger actual workflow
gh workflow run docs-maintenance.yml -f dry_run=true

# Verify PR creation
gh pr list --label documentation

# Test sub-agent trigger
Task(docs-guardian, "run maintenance --dry-run")
```

---

## Success Criteria

- [ ] Workflow triggers on schedule (daily 2 AM UTC)
- [ ] Workflow triggers manually via Actions UI
- [ ] Claude sub-agent can trigger workflow
- [ ] Content analysis correctly categorizes 90%+ of files
- [ ] All plugins execute without errors
- [ ] PR created with accurate report
- [ ] Dry-run mode works correctly
- [ ] AGENT.md files auto-created with correct content
- [ ] README.md files auto-generated with file lists
- [ ] Naming violations detected and fixed
- [ ] Broken links detected and repaired
- [ ] Documentation complete and clear

---

## Error Handling

### Common Failure Scenarios

**1. File Categorization Ambiguity**
- **Detection**: Confidence score < 70%
- **Handling**: Move to `docs/orphaned/`, report in PR
- **Manual Action**: User reviews and moves to correct location

**2. Naming Conflict**
- **Detection**: Target file already exists
- **Handling**: Append timestamp: `file-YYYYMMDD-HHMMSS.md`
- **Manual Action**: User merges or renames

**3. Broken Link Not Repairable**
- **Detection**: File not found, no obvious replacement
- **Handling**: Report in PR with file:line location
- **Manual Action**: User fixes link

**4. External Link 404**
- **Detection**: markdown-link-check reports 404
- **Handling**: Report in PR, do not attempt fix
- **Manual Action**: User updates or removes link

**5. Workflow Failure**
- **Detection**: GitHub Actions job fails
- **Handling**: Send notification, log error
- **Manual Action**: Review logs, fix script, re-run

---

## Testing Strategy

### Unit Tests

**Categorization Logic**:
```javascript
describe('FileCategor izer', () => {
  test('frontmatter type=design → system/design/', () => {});
  test('filename prefix design- → system/design/', () => {});
  test('content keywords: verification → system/execution/', () => {});
  test('ambiguous content → docs/orphaned/', () => {});
});
```

**Naming Convention Fixer**:
```javascript
describe('NameConventionPlugin', () => {
  test('Design-Phase1.md → design-phase1.md', () => {});
  test('phase1_crm.md → design-phase1-crm.md', () => {});
  test('Getting Started.md → getting-started.md', () => {});
});
```

### Integration Tests

**Full Workflow**:
```bash
# Create test files in /src
mkdir -p test/fixtures/src
echo "# Test Verification Doc" > test/fixtures/src/test-verification.md

# Run maintenance
node scripts/docs-maintenance.js --dry-run --test-mode

# Verify moves
test -f test/fixtures/docs/system/execution/test-verification.md
```

### End-to-End Tests

**GitHub Actions**:
1. Trigger workflow manually
2. Verify workflow completes
3. Verify PR created
4. Verify PR contains report
5. Review report accuracy

---

## Maintenance & Operations

### Monitoring

**GitHub Actions**:
- Check workflow run history: `gh run list --workflow=docs-maintenance.yml`
- View logs: `gh run view <run-id> --log`

**PR Review**:
- Review PRs with label `documentation, automated`
- Verify report accuracy
- Merge or request changes

### Updating Keywords

**Location**: `scripts/lib/keywords.js`

```javascript
module.exports = {
  SYSTEM_KEYWORDS: [...],
  USER_KEYWORDS: [...],
  API_KEYWORDS: [...]
};
```

**Process**:
1. Edit keywords file
2. Test categorization: `node scripts/test-categorization.js`
3. Commit changes
4. Next run uses updated keywords

### Adding New Plugins

**Steps**:
1. Create plugin file: `scripts/plugins/new-plugin.js`
2. Extend BasePlugin class
3. Implement scan(), fix(), report() methods
4. Add to plugin list in `scripts/docs-maintenance.js`
5. Test individually: `node scripts/test-plugin.js NewPlugin`
6. Test in full workflow: `node scripts/docs-maintenance.js --dry-run`

---

## Security Considerations

### Permissions

**GitHub Actions**:
- `contents: write` - Required to create branches and commits
- `pull-requests: write` - Required to create PRs

**Principle of Least Privilege**: No additional permissions granted

### Secrets

**GITHUB_TOKEN**:
- Automatically provided by GitHub Actions
- Scoped to repository
- No additional secrets required

### Code Injection Prevention

**User Input**:
- No user input in workflow (only dry_run boolean)
- File paths validated against whitelist
- No shell command injection vectors

---

## Future Enhancements

### Phase 2 Features (Post-MVP)

1. **Screenshot Currency Check**
   - Detect screenshots in user docs
   - Compare timestamps with referenced code
   - Report outdated screenshots

2. **Frontmatter Validation**
   - Validate YAML frontmatter structure
   - Check required fields
   - Fix common errors

3. **Cross-Reference Verification**
   - Verify all cross-references exist
   - Detect orphaned documents
   - Suggest missing links

4. **Duplicate Content Detection**
   - Find duplicate sections
   - Suggest consolidation
   - Report in PR

5. **AI-Enhanced Categorization**
   - Use LLM for ambiguous files
   - Improve categorization accuracy
   - Reduce orphaned files

---

## Appendices

### A. File Structure

```
piercedesk6/
├── .github/
│   └── workflows/
│       └── docs-maintenance.yml
├── .claude/
│   ├── agents/
│   │   └── docs-guardian.md
│   └── scripts/
│       └── run-docs-maintenance.sh
├── scripts/
│   ├── docs-maintenance.js
│   ├── lib/
│   │   ├── keywords.js
│   │   ├── categorizer.js
│   │   └── report-generator.js
│   ├── plugins/
│   │   ├── base-plugin.js
│   │   ├── source-file-scanner-plugin.js
│   │   ├── missing-files-plugin.js
│   │   ├── name-convention-plugin.js
│   │   ├── broken-links-plugin.js
│   │   └── orphaned-root-files-plugin.js
│   └── test/
│       ├── categorization.test.js
│       └── test-plugin.js
└── docs/
    ├── system/
    │   └── as-builts/
    │       └── as-built-docs-guardian.md
    └── orphaned/
```

### B. Dependencies

**Production**:
- `markdown-link-check` - Link validation
- `gray-matter` - YAML frontmatter parsing
- `glob` - File pattern matching

**Development**:
- `jest` - Testing framework
- `@actions/core` - GitHub Actions toolkit
- `@actions/github` - GitHub API client

### C. References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [markdown-link-check](https://github.com/tcort/markdown-link-check)
- [gray-matter](https://github.com/jonschlinkert/gray-matter)
- [PierceDesk Documentation Guide](../system/execution/guides/DOCUMENTATION-GUIDE.md)

---

**Last Updated**: 2026-01-30
**Next Review**: After Phase 1 completion
**Owner**: Documentation Team
