# System Documentation Governance

**Purpose:** Internal SaaS application design, execution, and results documentation.
**Audience:** Development team, AI agents, architects, project managers
**NOT for:** User-facing content, end-user guides, customer documentation

---

## Naming Conventions

### Standard Format

All system documents follow this naming pattern:

```
{type}-{feature|phase}-{topic}.md
```

### Document Type Prefixes

| Prefix | Purpose | Example |
|--------|---------|---------|
| `design-` | Pre-implementation architecture and decisions | `design-phase1.1-crm-schema.md` |
| `execution-` | Implementation logs, progress, test results | `execution-phase1.2-auth-integration.md` |
| `as-built-` | Current deployed state (living documents) | `as-built-crm-desk-mvp.md` |
| `plan-` | Detailed implementation plans | `plan-2026-01-30-dashboard-widgets.md` |
| `INDEX-` | Master tracking documents for features | `INDEX-crm-desk-mvp.md` |
| `debug-` | Bug investigation and resolution | `debug-BUG-123-rls-policy.md` |
| `realign-` | Scope or approach changes | `realign-2026-01-29-api-approach.md` |

### Naming Rules

**✅ DO:**
- Use all lowercase with hyphens (kebab-case)
- Start with document type prefix
- Use date format: `YYYY-MM-DD` for timestamped docs
- Use phase format: `phase{major}.{minor}` for sequential work
- Use descriptive feature names: `crm-schema`, `auth-integration`, `dashboard-widgets`

**❌ DON'T:**
- Use spaces, underscores, or CamelCase
- Omit document type prefix
- Use generic names like `doc1.md`, `notes.md`, `temp.md`
- Mix naming conventions within same folder

### Examples

```
✅ CORRECT:
design-phase1.1-crm-schema.md
execution-phase1.2-auth-integration.md
as-built-authentication-system.md
plan-2026-01-30-dashboard-implementation.md
INDEX-crm-desk-mvp.md
debug-BUG-456-supabase-connection.md

❌ INCORRECT:
CRM_Schema.md
phase1.1.md
auth integration.md
dashboardPlan.md
notes-2026-01-30.md
```

---

## Required Frontmatter

All system documents MUST include YAML frontmatter:

```yaml
---
title: "Human-readable document title"
type: "design" | "execution" | "as-built" | "plan" | "INDEX" | "debug" | "realign"
status: "planned" | "in-progress" | "complete" | "blocked" | "locked"
version: "X.Y"
created: "YYYY-MM-DD"
updated: "YYYY-MM-DD"
phase: "phase{major}.{minor}" # Optional, for phase-based work
feature: "feature-name" # Optional, for feature tracking
github_issue: "123" # Optional, for issue tracking
---
```

### Frontmatter Field Definitions

| Field | Required | Values | Description |
|-------|----------|--------|-------------|
| `title` | Yes | String | Human-readable title (can have spaces) |
| `type` | Yes | Enum | Document type (design, execution, as-built, plan, INDEX, debug, realign) |
| `status` | Yes | Enum | Current status (planned, in-progress, complete, blocked, locked) |
| `version` | Yes | Semver | Version number (X.Y format) |
| `created` | Yes | Date | Creation date (YYYY-MM-DD) |
| `updated` | Yes | Date | Last update date (YYYY-MM-DD) |
| `phase` | Optional | String | Phase identifier (e.g., "phase1.2") |
| `feature` | Optional | String | Feature name for grouping |
| `github_issue` | Optional | Number | Related GitHub issue number |

### Status Lifecycle

```
planned → in-progress → complete → locked (after merge)
                ↓
            blocked (temporary state, returns to in-progress)
```

- **planned:** Document created, work not started
- **in-progress:** Active development or documentation
- **complete:** Work finished, verified, PR merged
- **blocked:** Work paused due to dependencies or issues
- **locked:** Final state, no further changes (historical record)

---

## Folder Organization

### /docs/system/ Structure

```
system/
├── AGENT.md              # This file - governance rules
├── README.md             # Navigation and quick reference
│
├── as-builts/            # Current deployed state (living documents)
│   ├── as-built-crm-desk-mvp.md
│   ├── as-built-authentication-system.md
│   └── as-built-database-schema.md
│
├── design/               # Pre-implementation architecture
│   ├── architecture/     # System architecture docs
│   ├── authentication/   # Auth system design
│   ├── user-journeys/    # User flow and journey maps
│   ├── design-phase1.1-crm-schema.md
│   └── design-phase1.2-auth-integration.md
│
├── execution/            # Implementation logs and results
│   ├── guides/           # Developer guides
│   ├── quality/          # Quality audits and reports
│   ├── testing/          # Test results and reports
│   ├── execution-phase1.1-crm-implementation.md
│   └── execution-phase1.2-auth-verification.md
│
├── plans/                # Detailed implementation plans
│   ├── plan-2026-01-30-dashboard-widgets.md
│   └── plan-2026-01-29-phase1.2-integration.md
│
├── roadmap/              # Strategic planning
│   └── roadmap-2026-q1.md
│
└── vision/               # Product vision and goals
    └── vision-piercedesk.md
```

### Folder Purpose Definitions

| Folder | Purpose | Document Types | Update Frequency |
|--------|---------|----------------|------------------|
| `as-builts/` | Current production state | as-built | After every major change |
| `design/` | Pre-implementation architecture | design | Before implementation |
| `execution/` | Implementation logs & results | execution | During implementation |
| `plans/` | Detailed implementation plans | plan | Before each phase |
| `roadmap/` | Strategic planning | roadmap | Quarterly or major releases |
| `vision/` | Product vision & goals | vision | Rarely (foundational) |

---

## Quality Standards

### 1. Code References

Always include file path and line numbers for code references:

```markdown
✅ CORRECT:
The authentication logic is in src/lib/auth/supabase.ts:45-67

❌ INCORRECT:
The authentication logic is in the supabase file
```

### 2. Verification Evidence

Always include command output for verification claims:

```markdown
✅ CORRECT:
## Verification
\`\`\`bash
$ npm run build
✓ Build completed successfully (exit code 0)
\`\`\`

❌ INCORRECT:
## Verification
The build passed.
```

### 3. Cross-References

Link to related documents:

```markdown
✅ CORRECT:
- Related: [INDEX-crm-desk-mvp.md](./INDEX-crm-desk-mvp.md)
- Design: [design-phase1.1-crm-schema.md](./design/design-phase1.1-crm-schema.md)
- As-built: [as-built-authentication-system.md](./as-builts/as-built-authentication-system.md)

❌ INCORRECT:
See the INDEX file for more details.
```

### 4. No Orphaned Documents

Every execution document MUST link back to its INDEX:

```markdown
---
title: "Phase 1.2 Authentication Integration"
type: "execution"
---

## Master Tracking
INDEX: [INDEX-crm-desk-mvp.md](./INDEX-crm-desk-mvp.md)
```

### 5. Test Results & Evidence

Include screenshots, logs, and command outputs:

```markdown
## Test Results

\`\`\`bash
$ npm test
  PASS  src/components/auth/LoginForm.test.tsx
  PASS  src/components/auth/SignupForm.test.tsx

Test Suites: 2 passed, 2 total
Tests:       15 passed, 15 total
\`\`\`

Screenshot: ![Login flow test](./testing/screenshots/login-flow-2026-01-30.png)
```

---

## Document Lifecycle

### Creation

1. Create document with proper naming convention
2. Add required YAML frontmatter
3. Set status to `planned`
4. Link to INDEX if part of feature work

### In Progress

1. Update status to `in-progress`
2. Update `updated` date in frontmatter
3. Document progress with dated entries
4. Include code references and verification evidence

### Completion

1. Update status to `complete`
2. Final verification evidence included
3. All cross-references verified
4. PR merged to main

### Locking

1. Update status to `locked` after merge
2. Document becomes historical record
3. No further changes (create new version if needed)
4. Archive old versions if major changes required

---

## Templates

Use templates from `.claude/templates/`:

| Template | When to Use |
|----------|-------------|
| `INDEX-template.md` | Start of every feature |
| `phase-design-template.md` | Before implementation |
| `phase-execution-template.md` | During development |
| `debug-template.md` | When bugs occur |
| `realignment-template.md` | When plans change |
| `as-built-template.md` | After merging |

---

## Git Workflow Integration

### Branch Naming

System docs are created on feature branches:

```bash
git checkout -b feature/desk-{feature-name}
```

### Commit Messages

Include document type in commit messages:

```bash
git commit -m "docs(system): Add design-phase1.3-contacts

Design document for contacts management feature.
Includes schema, UI components, and API endpoints.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### Pull Requests

Link PRs to INDEX documents:

```markdown
## Documentation
- INDEX: [docs/system/INDEX-crm-desk-mvp.md]
- Design: [docs/system/design/design-phase1.3-contacts.md]
- Execution: [docs/system/execution/execution-phase1.3-contacts.md]
```

---

## Prohibited Content

**NEVER include in /docs/system/:**

❌ User-facing documentation (belongs in `/docs/user-docs/`)
❌ Marketing content
❌ Sales materials
❌ Customer success guides
❌ End-user tutorials
❌ Public API documentation (unless internal)

**System docs are for internal development team use only.**

---

## Maintenance

### Monthly Review

- [ ] Update as-built documents with current state
- [ ] Archive completed features (move to locked status)
- [ ] Verify all links work
- [ ] Check naming convention compliance
- [ ] Audit frontmatter completeness

### Quarterly Audit

- [ ] Review document organization
- [ ] Consolidate duplicate content
- [ ] Update roadmap documents
- [ ] Archive outdated debug/realign docs
- [ ] Generate documentation health report

---

## Questions?

For guidance on:
- **Creating documents:** See templates in `.claude/templates/`
- **Feature workflows:** Read `docs/system/execution/guides/DOCUMENTATION-GUIDE.md`
- **Naming issues:** Check examples in this file
- **Cross-referencing:** See Quality Standards section above

**Last Updated:** 2026-01-30
**Version:** 1.0
**Owner:** Development Team
