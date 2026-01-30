---
title: "System Documentation Overview"
type: "guide"
status: "complete"
version: "1.0"
created: "2026-01-30"
updated: "2026-01-30"
---

# System Documentation

Internal documentation for PierceDesk development team, architects, and AI agents.

**Audience:** Developers, architects, project managers, AI assistants
**Purpose:** Design, execution, testing, and architecture documentation

---

## 📁 Folder Structure

```
system/
├── AGENT.md              # Governance rules (READ THIS FIRST!)
├── README.md             # This file - navigation guide
│
├── as-builts/            # Current deployed state (living documents)
├── design/               # Pre-implementation architecture
│   ├── architecture/     # System architecture docs
│   ├── authentication/   # Auth system design
│   └── user-journeys/    # User flow and journey maps
├── execution/            # Implementation logs and results
│   ├── guides/           # Developer guides
│   ├── quality/          # Quality audits
│   └── testing/          # Test results
├── plans/                # Detailed implementation plans
├── roadmap/              # Strategic planning
└── vision/               # Product vision and goals
```

---

## 🎯 Quick Start

### New to System Docs?

1. **Read [AGENT.md](./AGENT.md)** - Governance, naming, standards
2. **Browse [design/](./design/)** - See existing architecture docs
3. **Check [execution/](./execution/)** - See implementation examples
4. **Use templates** - `.claude/templates/` for new documents

### Starting a New Feature?

1. Create **INDEX** file: `cp .claude/templates/INDEX-template.md ./INDEX-{feature}.md`
2. Create **design** doc: `./design/design-{phase}-{topic}.md`
3. Create **plan**: `./plans/plan-YYYY-MM-DD-{topic}.md`
4. Create **execution** doc: `./execution/execution-{phase}-{topic}.md`
5. Update **as-built** after merge: `./as-builts/as-built-{feature}.md`

### Need to Document a Bug?

1. Create debug doc: `./execution/debug-BUG-{number}-{topic}.md`
2. Document investigation, root cause, fix
3. Link to INDEX if part of feature work

---

## 📝 Document Types

### INDEX Documents

**Location:** `./INDEX-{feature}.md`
**Purpose:** Master tracking document for features
**When:** Start of every feature
**Template:** `.claude/templates/INDEX-template.md`

**Example:** `INDEX-crm-desk-mvp.md`

### Design Documents

**Location:** `./design/design-{phase}-{topic}.md`
**Purpose:** Pre-implementation architecture, decisions, trade-offs
**When:** Before starting implementation
**Template:** `.claude/templates/phase-design-template.md`

**Examples:**
- `design-phase1.1-crm-schema.md`
- `design-phase1.2-auth-integration.md`

### Execution Documents

**Location:** `./execution/execution-{phase}-{topic}.md`
**Purpose:** Implementation logs, progress, test results
**When:** During development
**Template:** `.claude/templates/phase-execution-template.md`

**Examples:**
- `execution-phase1.1-crm-implementation.md`
- `execution-phase1.2-auth-verification.md`

### As-Built Documents

**Location:** `./as-builts/as-built-{feature}.md`
**Purpose:** Current deployed state (living documents)
**When:** After merge, updated with changes
**Template:** `.claude/templates/as-built-template.md`

**Examples:**
- `as-built-crm-desk-mvp.md`
- `as-built-authentication-system.md`

### Plan Documents

**Location:** `./plans/plan-YYYY-MM-DD-{topic}.md`
**Purpose:** Detailed implementation plans
**When:** Before each phase/task
**Format:** Dated for easy chronological tracking

**Examples:**
- `plan-2026-01-30-dashboard-widgets.md`
- `plan-2026-01-29-phase1.2-integration.md`

### Debug Documents

**Location:** `./execution/debug-BUG-{number}-{topic}.md`
**Purpose:** Bug investigation and resolution
**When:** When bugs occur
**Template:** `.claude/templates/debug-template.md`

**Examples:**
- `debug-BUG-123-rls-policy.md`
- `debug-BUG-456-supabase-connection.md`

### Realignment Documents

**Location:** `./execution/realign-YYYY-MM-DD-{topic}.md`
**Purpose:** Document scope/approach changes
**When:** When plans change significantly
**Template:** `.claude/templates/realignment-template.md`

**Examples:**
- `realign-2026-01-29-api-approach.md`
- `realign-2026-01-30-schema-changes.md`

---

## 📐 Naming Conventions

### Standard Format

```
{type}-{feature|phase}-{topic}.md
```

### Type Prefixes

| Prefix | Document Type | Example |
|--------|--------------|---------|
| `design-` | Design documents | `design-phase1.1-crm-schema.md` |
| `execution-` | Execution logs | `execution-phase1.2-auth.md` |
| `as-built-` | As-built docs | `as-built-crm-desk-mvp.md` |
| `plan-` | Implementation plans | `plan-2026-01-30-dashboard.md` |
| `INDEX-` | Master tracking | `INDEX-crm-desk-mvp.md` |
| `debug-` | Bug investigation | `debug-BUG-123-rls.md` |
| `realign-` | Plan changes | `realign-2026-01-29-api.md` |

### Rules

✅ **DO:**
- All lowercase with hyphens (kebab-case)
- Start with document type prefix
- Use dates: `YYYY-MM-DD` format
- Use phases: `phase{major}.{minor}` format
- Descriptive topics: `crm-schema`, `auth-integration`

❌ **DON'T:**
- Use spaces, underscores, CamelCase
- Omit type prefix
- Use generic names: `doc1.md`, `notes.md`
- Mix naming conventions

📘 **Full Rules:** See [AGENT.md](./AGENT.md#naming-conventions)

---

## 🔍 Finding Documents

### By Feature

1. Find INDEX: `INDEX-{feature}.md`
2. Follow links to design, execution, as-built docs
3. All feature docs cross-reference the INDEX

### By Phase

1. Look in `design/` for `design-phase{X}.{Y}-*.md`
2. Look in `execution/` for `execution-phase{X}.{Y}-*.md`
3. Check INDEX for phase overview

### By Date

1. Plans: `plans/plan-YYYY-MM-DD-*.md`
2. Debugs: `execution/debug-BUG-*-*.md`
3. Realignments: `execution/realign-YYYY-MM-DD-*.md`

### By Type

```bash
# Find all design docs
find ./design -name "design-*.md"

# Find all execution docs
find ./execution -name "execution-*.md"

# Find all as-builts
ls ./as-builts/as-built-*.md

# Find all plans
ls ./plans/plan-*.md
```

---

## ✅ Quality Standards

### 1. Required Frontmatter

Every system document MUST have:

```yaml
---
title: "Document title"
type: "design" | "execution" | "as-built" | "plan" | "INDEX"
status: "planned" | "in-progress" | "complete" | "blocked" | "locked"
version: "X.Y"
created: "YYYY-MM-DD"
updated: "YYYY-MM-DD"
---
```

### 2. Code References

Always include file:line format:

```markdown
✅ CORRECT: src/lib/auth/supabase.ts:45-67
❌ INCORRECT: the supabase auth file
```

### 3. Verification Evidence

Always include command output:

```markdown
\`\`\`bash
$ npm run build
✓ Build completed (exit 0)
\`\`\`
```

### 4. Cross-References

Link to related documents:

```markdown
- INDEX: [INDEX-crm-desk-mvp.md](./INDEX-crm-desk-mvp.md)
- Design: [design-phase1.1-crm-schema.md](./design/design-phase1.1-crm-schema.md)
```

### 5. No Orphans

Every execution doc links back to INDEX.

📘 **Full Standards:** See [AGENT.md](./AGENT.md#quality-standards)

---

## 🔄 Document Lifecycle

```
planned → in-progress → complete → locked
            ↓
        blocked (temporary)
```

- **planned:** Created, work not started
- **in-progress:** Active development
- **complete:** Finished, verified, merged
- **blocked:** Paused due to dependencies
- **locked:** Final state, historical record

Update status in YAML frontmatter.

---

## 🚫 Prohibited Content

**NEVER include in /docs/system/:**

❌ User-facing documentation → belongs in `/docs/user-docs/`
❌ Marketing content
❌ Sales materials
❌ End-user tutorials
❌ Customer success guides

**System docs are for internal development only.**

---

## 🔗 Related Resources

- **[Parent README](../README.md)** - Main documentation hub
- **[AGENT.md](./AGENT.md)** - Complete governance rules
- **[User Docs](../user-docs/)** - End-user documentation
- **[Templates](../../.claude/templates/)** - Document templates

---

## 📦 Archives

Completed and locked documents may be moved to archives:

```bash
system/archives/2026-q1/
```

Archived docs preserve history but are no longer actively maintained.

---

**Last Updated:** 2026-01-30
**Owner:** Development Team
