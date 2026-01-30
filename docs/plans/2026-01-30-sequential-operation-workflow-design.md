# Sequential Operation Workflow Design

**Created:** 2026-01-30
**Type:** Design Document
**Status:** Validated

## Overview

This design document describes the Sequential Operation Workflow for converting PierceDesk application sections from mock data to live Supabase database. The workflow is an orchestrator-driven pipeline that processes sections systematically, wiring existing Aurora-based UI to production database infrastructure.

## Design Principles

1. **Bottom-up execution**: Database → API → UI (foundation first)
2. **Sequential processing**: One complete page at a time (all layers + tests)
3. **Section-by-section**: Complete one logical section before moving to next
4. **Automated progression**: Auto-transition between page types after human PR approval
5. **GitHub-first coordination**: All agent communication through GitHub issues
6. **Skill-based operations**: Use existing skills (github-workflow, brainstorming, writing-plans) for consistency

## High-Level Orchestration Flow

### Phase 1: Section Discovery & Inventory

When user requests "convert [section] to live database," orchestrator:

1. **Analyzes section structure** (e.g., `src/app/(main)/apps/crm/`)
2. **Categorizes pages by complexity**:
   - **List Pages** (read-only displays - simplest)
   - **Create Pages** (forms, data entry)
   - **Interaction Pages** (edit, delete, status changes)
   - **Dashboard Pages** (aggregations, real-time - complex)
3. **Creates section INDEX**: `docs/system/INDEX-{section}-section.md`
   - Tracks overall Phase X.Y progress
   - Links to brainstorm and all plan.md files
   - Cross-cutting decisions and section status

### Phase 2: Comprehensive Brainstorming

1. **Invoke brainstorming skill**: `Skill tool with skill: "superpowers:brainstorming"`
2. **Create shared brainstorm doc**: `docs/system/design/brainstorm-{date}-{section}-section.md`
3. **Detailed page-by-page analysis** for ALL pages in section:
   - Current UI components used
   - Mock data → real data mapping
   - Required database tables/columns (full schema)
   - API endpoints needed (routes, methods, parameters)
   - RLS policies required (org isolation, user permissions)
   - Test scenarios (data/API/UI/E2E)
4. **Create feature branch**: `feature/desk-{section}-database-wiring`
   - One branch per section (used for all page types)
   - All agents work on this branch
   - Branch stays alive until section complete
5. **Commit and push**: INDEX + brainstorm to feature branch

### Phase 3: Sequential Page Type Execution

Process each page type in order: **List → Create → Interaction → Dashboard**

For each page type, orchestrator:

#### 3.1: Create Plan.md

```
docs/system/plans/plan-{date}-{section}-{page-type}-pages.md
```

**Frontmatter** (YAML):
```yaml
---
title: "Phase X.Y.Z: {Section} {PageType} Pages - Database Wiring"
type: "execution"
status: "in-progress"
version: "X.Y.Z"
phase: "X.Y.Z"
section: "{Section}"
page_type: "{type}"
created: "YYYY-MM-DD"
updated: "YYYY-MM-DDTHH:MM:SS-06:00"  # CST ISO
github_issue: {number}
feature_branch: "feature/desk-{section}-database-wiring"
brainstorm_doc: "docs/system/design/brainstorm-{date}-{section}-section.md"
---
```

**Content sections**:
- Goal and pages in scope
- Tasks summary (from brainstorm) for each page
- Agent assignments (supabase, wiring, react-mui, playwright-tester)
- Test requirements (data/API/UI/E2E per page)
- Deliverables checklist
- Execution log (updated by agents)

#### 3.2: Create GitHub Issue

1. **Invoke github-workflow skill**: `Skill tool with skill: "github-workflow"`
2. Skill creates issue with:
   - Title: "Phase X.Y.Z: {Section} {PageType} Pages - Database Wiring"
   - Links to INDEX, brainstorm, plan.md
   - Page checklist ([ ] Page 1, [ ] Page 2, etc.)
   - Branch name
   - Agent identification format
3. **Update plan.md frontmatter** with `github_issue` number
4. **Commit plan.md** to feature branch

#### 3.3: Execute Pages One-by-One

**For EACH page in plan.md**, run **bottom-up sequential pipeline**:

##### Step 1: Database Layer (supabase-database-architect)

```
1. Orchestrator invokes: Task tool with agent: "supabase-database-architect"
2. Agent workflow:
   a. Invoke github-workflow skill to post "Starting database work - {page}"
   b. Invoke superpowers:writing-plans to create agent's own sub-plan
      - Agent does NOT modify main plan.md tasks/deliverables/tests
      - Agent creates detailed HOW-TO plan for achieving the tasks
   c. Implement database layer using Supabase MCP tools:
      - Create tables with uuid pk, org_id for multi-tenancy
      - Write and apply migrations (via MCP)
      - Create seed data for testing
      - Implement RLS policies (org isolation)
   d. Invoke github-workflow skill to post completion summary
   e. Agent updates plan.md execution log with work done
```

##### Step 2: Data Layer Testing (playwright-tester)

```
1. Orchestrator invokes: Task tool with agent: "playwright-tester"
2. Tester creates data layer tests:
   - Table exists with correct schema
   - RLS policies enforce org isolation
   - Seed data is queryable
   - Foreign keys and constraints work
3. Tester runs tests
4. Tester updates plan.md with PASS/FAIL results
5. If FAIL:
   - Tester posts failures to GitHub issue
   - Orchestrator re-invokes supabase-database-architect to fix
   - Agent fixes, posts update to GitHub
   - Tester re-runs tests
   - Repeat until PASS
6. If PASS: Continue to API layer
```

##### Step 3: API Layer (wiring-agent)

```
1. Orchestrator invokes: Task tool with agent: "wiring-agent"
2. Agent workflow:
   a. Invoke github-workflow skill to post "Starting API work - {page}"
   b. Invoke superpowers:writing-plans for sub-plan
   c. Implement API layer:
      - Create Next.js API routes or server actions
      - Implement SWR hooks for data fetching
      - Integrate Supabase client
      - Add error handling
   d. Invoke github-workflow skill to post completion summary
   e. Update plan.md execution log
```

##### Step 4: API Layer Testing (playwright-tester)

```
1. Tester creates API integration tests:
   - Endpoints return correct data from database
   - Pagination/filtering works
   - Authentication required
   - RLS policies respected through API
2. Tester runs tests, updates plan.md with PASS/FAIL
3. If FAIL: wiring-agent fixes → retest (repeat until PASS)
4. If PASS: Continue to UI layer
```

##### Step 5: UI Layer (react-mui-frontend-engineer)

```
1. Orchestrator invokes: Task tool with agent: "react-mui-frontend-engineer"
2. Agent workflow:
   a. Invoke github-workflow skill to post "Starting UI work - {page}"
   b. Invoke superpowers:writing-plans for sub-plan
   c. Implement UI layer:
      - Remove mock data from existing Aurora components
      - Wire UI to real API endpoints (SWR hooks)
      - Add loading states (skeletons)
      - Add error states (boundaries)
      - Adjust UI if data structure differs from mocks
   d. Invoke github-workflow skill to post completion summary
   e. Update plan.md execution log
```

##### Step 6: UI Layer Testing (playwright-tester)

```
1. Tester creates UI interaction tests:
   - Page renders with live data
   - User interactions work (clicks, filters, pagination)
   - Loading states display correctly
   - Error states handle API failures
2. Tester runs tests, updates plan.md with PASS/FAIL
3. If FAIL: react-mui fixes → retest (repeat until PASS)
4. If PASS: Continue to E2E test
```

##### Step 7: Full E2E Integration Test

```
1. Tester runs comprehensive E2E test covering full flow:
   - User loads page → sees data from database
   - User interacts → sees updates reflected
   - Complete user journey validated
2. If PASS: Page complete, move to next page in plan.md
3. If FAIL:
   - Orchestrator analyzes failure
   - Assigns to responsible agent (database/API/UI)
   - Agent fixes
   - Retest from appropriate layer
```

**Repeat Steps 1-7 for each page** in the plan.md until all pages complete.

#### 3.4: Create PR (After All Pages in Type Complete)

```
1. Orchestrator invokes: Skill tool with skill: "github-workflow"
2. Skill creates PR:
   - From: feature/desk-{section}-database-wiring
   - To: main
   - Title: "Phase X.Y.Z: {Section} {PageType} Pages - Database Wiring"
   - Body includes:
     - Summary of changes
     - Test evidence (data/API/UI/E2E all PASS)
     - Build/lint verification
     - Documentation links
     - "/q review" phrase
     - Issue link
   - Assigned to: @RockwallJMC
3. Post to GitHub issue: "PR created, awaiting review"
4. **WAIT** for human to merge PR (do not proceed)
```

#### 3.5: Post-Merge Archive & Transition

**After @RockwallJMC merges PR**:

```
1. Collect agent summaries from GitHub issue:
   - All agent completion summaries
   - Test results (pass/fail counts)
   - PR review/corrections made
   - Timestamp of merge (CST ISO)
   - Duration (plan creation → merge)

2. Archive plan.md:
   - Rename: plan-{date}-{section}-{type}.md
            → phase{X.Y.Z}-{date}-{section}-{type}.md
   - Move to: docs/system/plans/ (already there, just rename)
   - Update frontmatter:
     - status: "complete"
     - completed: "YYYY-MM-DDTHH:MM:SS-06:00"
     - merged_pr: {number}
   - Append Completion Summary section:
     - Agent summaries
     - Duration
     - PR review/corrections
     - Recommendations for next phase

3. Update section INDEX:
   - Mark phase X.Y.Z as complete
   - Add link to archived plan
   - Add PR reference
   - Update next phase to in-progress

4. Final GitHub issue update:
   - Invoke github-workflow skill
   - Post completion summary
   - Post link to archived plan
   - Post duration and next phase info
   - Assign to @RockwallJMC
   - Close issue

5. Commit archived plan to main branch

6. **IMMEDIATELY** start next page type:
   - Go to step 3.1 (Create Plan.md) for next page type
   - No waiting for user approval
   - Automatic progression
```

### Phase 4: Section Completion

**When last page type (Dashboard) completes**:

```
1. Archive final plan.md (same process as 3.5)
2. Update section INDEX:
   - Mark ALL phases complete
   - Add section completion timestamp
   - Summary of entire section
3. Post section completion to INDEX GitHub issue
4. Assign INDEX to @RockwallJMC for final review
5. Clean up feature branch:
   - Delete local: git branch -d feature/desk-{section}-database-wiring
   - Delete remote: git push origin --delete feature/desk-{section}-database-wiring
6. **WAIT** for user to specify next section or end
```

## Agent Execution Details

### Agent Communication Protocol

**All agents follow this GitHub posting protocol:**

1. **Start notification**: Invoke github-workflow skill to post "Starting work"
   - Must include: `**Agent**: {agent-name}`
   - Page being worked on
   - Layer (database/API/UI)

2. **Completion summary**: Invoke github-workflow skill to post summary
   - Must include: `**Agent**: {agent-name}`
   - Work completed (specific files, changes)
   - Test results
   - Next step

3. **Questions (only channel)**: Agents CANNOT ask orchestrator directly
   - Must post to GitHub issue
   - Must tag with `[QUESTION]` prefix
   - Orchestrator monitors issue and responds there

### Agent Sub-Planning

**Every implementation agent must:**

1. Invoke `superpowers:writing-plans` skill FIRST
2. Create their own detailed execution plan
3. **DO NOT modify** main plan.md tasks/deliverables/tests
4. Sub-plan is for HOW to achieve tasks, not WHAT tasks are

### Testing Agent Responsibilities

**playwright-tester agent:**

1. Creates tests for specific layer (data/API/UI)
2. Runs tests and captures output
3. Updates plan.md with PASS/FAIL results
4. Posts detailed results to GitHub issue
5. If FAIL: Posts specific failures for responsible agent to fix
6. Re-runs tests after fixes until PASS

## Phase Numbering Convention

**Hierarchical sub-phases per section:**

```
Phase 1.1 - CRM Section (major phase)
  Phase 1.1.1 - CRM List Pages (sub-phase)
  Phase 1.1.2 - CRM Create Pages (sub-phase)
  Phase 1.1.3 - CRM Interaction Pages (sub-phase)
  Phase 1.1.4 - CRM Dashboard Pages (sub-phase)

Phase 1.2 - Dashboard Section (major phase)
  Phase 1.2.1 - Dashboard List Pages
  Phase 1.2.2 - Dashboard Create Pages
  ...
```

## Document Structure

**Per section:**

```
docs/system/INDEX-{section}-section.md          # Master tracking (Phase X.Y)
docs/system/design/brainstorm-{date}-{section}-section.md  # Shared analysis

docs/system/plans/plan-{date}-{section}-list-pages.md      # Phase X.Y.1
docs/system/plans/plan-{date}-{section}-create-pages.md    # Phase X.Y.2
docs/system/plans/plan-{date}-{section}-interaction-pages.md  # Phase X.Y.3
docs/system/plans/plan-{date}-{section}-dashboard-pages.md    # Phase X.Y.4

# After completion, plans renamed to:
docs/system/plans/phase1.1.1-{date}-{section}-list-pages.md
docs/system/plans/phase1.1.2-{date}-{section}-create-pages.md
...
```

## Git Workflow

### Branch Strategy

**One feature branch per section:**
- Created after brainstorming, before first plan.md
- Name: `feature/desk-{section}-database-wiring`
- Used for ALL page types within section
- All PRs created from this branch → main
- Branch stays alive until section complete
- Deleted after final PR merges

### Commit Strategy

**Commits happen at these points:**

1. **Initial documentation**: INDEX + brainstorm to feature branch
2. **Plan creation**: Each plan.md committed when created
3. **Agent work**: Agents commit their changes (migrations, code, tests)
4. **Plan archiving**: Archived plan.md committed to main after merge

## CLAUDE.md Integration

**Add new section** to CLAUDE.md after "Skills Framework (MANDATORY)":

```markdown
## Sequential Operation Workflow (Database Wiring)

<EXTREMELY_IMPORTANT>
When user requests converting app sections to live database,
use the Sequential Operation Workflow.
</EXTREMELY_IMPORTANT>

### Trigger Phrases
- "Convert [section] to live database"
- "Wire [section] to Supabase"
- "Connect [section] to real data"
- "Remove mock data from [section]"
- "Database wiring for [section]"

[Full orchestrator instructions per phases 1-4 documented above]
```

## Critical Rules

**MANDATORY for this workflow:**

- ✅ Always invoke github-workflow skill for GitHub interactions
- ✅ Always bottom-up execution (supabase → wiring → react-mui)
- ✅ One complete page at a time (all 3 agents + tests per page)
- ✅ Sequential testing after each layer (data → API → UI → E2E)
- ✅ Agents MUST invoke superpowers:writing-plans for sub-plans
- ✅ Agents MUST invoke github-workflow skill for all GitHub posts
- ✅ All agent questions posted to GitHub issue only
- ✅ Wait for human PR merge before next page type
- ✅ Automatic transition to next page type after merge
- ✅ One feature branch per section, used for all page types
- ✅ Database is in Supabase cloud - ALWAYS use MCP tools

## Design Decisions Summary

| Decision | Rationale |
|----------|-----------|
| Bottom-up execution | Foundation (database) must exist before API, API before UI |
| One page at a time | Each page fully functional before moving to next, easier debugging |
| Section-by-section | Establishes patterns, manageable scope |
| Shared brainstorm | Database schema designed once for section, avoids duplication |
| One PR per page type | Related pages grouped, not too granular, not too large |
| Human review required | Quality gate, business logic validation |
| Automatic progression | Maintains momentum through page types after approval |
| One branch per section | Simplifies branch management, all page types related |
| GitHub-first coordination | All work tracked, agents coordinate asynchronously |

## Next Steps

1. Write implementation plan for CLAUDE.md redesign
2. Create git worktree for isolated implementation
3. Execute plan with verification at each step
4. Test workflow with small section (e.g., 2-3 pages)
5. Iterate based on testing feedback

---

**Design Status**: ✅ Validated
**Ready for Implementation**: Yes
**Implementation Plan**: docs/plans/2026-01-30-claude-md-sequential-workflow-implementation.md (to be created)
