# React MUI Frontend Engineer Agent Improvements

**Date:** 2026-01-30
**Type:** Agent Design Document
**Status:** Approved
**Agent:** `.claude/agents/react-mui-frontend-engineer.md`

## Executive Summary

The react-mui-frontend-engineer agent requires updates to fix systematic errors in component creation. Issues include: not asking before creating files, incorrect Paper `background={1}` usage, wrong Grid layouts (horizontal scrolls instead of responsive columns), and building from scratch instead of duplicating existing components.

This document defines new agent behavior rules, layout patterns, and mistake prevention guidelines based on comprehensive codebase analysis.

---

## 1. Current Problems & Required Changes

### The Current Issue

The react-mui-frontend-engineer agent is creating incorrect UI components because it:

1. **Doesn't ask before creating** - Builds pages/components without confirming the correct location
2. **Uses wrong Paper patterns** - Applies or omits `background={1}` inconsistently
3. **Creates wrong Grid layouts** - Uses Stack when should use Grid, or creates horizontal scrolls instead of responsive columns
4. **Builds from scratch** - Doesn't consistently search for and duplicate existing components

### Required Agent Behavior

- **ALWAYS ask first**: "Should this be a new page at [path] or a component at [path]?"
- **Follow Paper rules**: Use `background={1}` for tab containers and dashboard widgets, omit for simple wrappers
- **Use correct Grid patterns**: Responsive columns for card grids, not horizontal scrolls
- **Duplicate-first mandatory**: Search existing components, report findings, then duplicate and modify

---

## 2. Paper `background={1}` Rules

Based on codebase analysis across CRM, e-commerce, hiring, and other modules.

### USE `background={1}` when

**1. Dashboard widget cards**
- Example: `SaleFunnel.jsx`, `CRMKPIs.jsx` "Add New" card
- Pattern: `<Paper background={1} sx={{ height: 1, p: { xs: 3, md: 5 } }}>`

**2. Tab containers on detail pages**
- Example: `account-detail/index.jsx` line 92, `contact-detail/index.jsx` line 91
- Pattern: Paper wraps `<TabContext>` with tabs
- Always includes responsive padding: `p: { xs: 3, md: 5 }`

**3. Visual hierarchy elements**
- Example: `starter/index.jsx` lines 40, 79
- Used to create layered visual depth

### DON'T USE `background={1}` when

**1. Simple form wrappers**
- Example: `add-contact/index.jsx` line 35 ✅ CORRECT
- Pattern: `<Paper sx={{ p: { xs: 3, md: 5 } }}>` (no background prop)

**2. Full-page Kanban/board layouts**
- Example: `opportunities/index.jsx`, `kanban/kanban/index.jsx`
- These use custom styling or no background prop

**3. No Paper at all**
- Dashboard grid containers, notifications, file manager main views
- Use Box or Stack instead

### Agent Rule

Before adding any Paper component, determine its purpose and apply `background={1}` only if it matches the "USE" categories above.

---

## 3. Grid Layout Patterns

The codebase uses **three different grid approaches** depending on the use case. The agent must choose the correct one.

### Pattern 1: MUI Grid Component (for structured layouts)

**Use for:** Dashboard widgets, detail page sections, form layouts with defined columns

```javascript
<Grid container spacing={2}>
  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
    <Card>...</Card>
  </Grid>
</Grid>
```

**Examples:**
- Dashboard KPI cards: `size={{ xs: 12, sm: 6, md: 3 }}` (4 columns desktop)
- Recent Proposals (CORRECT): `size={{ xs: 12, sm: 6, md: 4 }}` (3 columns desktop)
- Main + Aside layouts: `size={{ xs: 12, md: 8, xl: 9 }}` + `size={{ xs: 12, md: 4, xl: 3 }}`

**When to use:**
- Need specific column counts at different breakpoints
- Dashboard widget grids
- Detail page with sidebar layouts

### Pattern 2: CSS Grid with auto-fill (for flexible card grids)

**Use for:** Product catalogs, file grids, media galleries where items should flow naturally

```javascript
<Box sx={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: 2
}}>
```

**Examples:**
- `ProductsGrid.jsx`: `minmax(320px, 1fr)`
- `FileGridView.jsx`: Responsive minmax values `{ xs: 'minmax(175px, 1fr)', md: 'minmax(185px, 1fr)' }`

**When to use:**
- Items should automatically wrap based on container width
- Don't need specific column counts per breakpoint
- Flexible product/file/media grids

### Pattern 3: Stack (for vertical lists)

**Use for:** Job lists, activity feeds, simple sequential content

```javascript
<Stack direction="column" spacing={2}>
  {items.map(item => <Card>...</Card>)}
</Stack>
```

**Examples:**
- `JobListView.jsx`: Vertical list of job cards
- Activity feeds, task lists

**When to use:**
- Simple vertical stacking
- No multi-column layout needed
- Sequential content

### Agent Decision Rule

- **Defined columns with specific breakpoint behavior** → MUI Grid
- **Flexible card grids that adapt to container width** → CSS Grid
- **Simple vertical lists** → Stack

---

## 4. Standard Page Templates

The codebase has **five recurring page structure patterns**. The agent should recognize and replicate these.

### Template 1: Simple Form Page

**Structure:** PageHeader + Paper wrapper (no background prop)

**Examples:** `add-contact/index.jsx`, `product-listing/index.jsx`

**Pattern:**
```javascript
<Grid container>
  <Grid size={12}>
    <PageHeader />
  </Grid>
  <Grid size={12}>
    <Paper sx={{ p: { xs: 3, md: 5 } }}>
      <FormComponent />
    </Paper>
  </Grid>
</Grid>
```

**When to use:** Simple form pages, stepper workflows, single-purpose input pages

### Template 2: Detail Page with Sidebar

**Structure:** Header + Grid with sidebar (3-4 cols) + main content (8-9 cols)

**Examples:** `account-detail/index.jsx`, `contact-detail/index.jsx`, `order/index.jsx`

**Key features:**
- Main content often has `Paper background={1}` for tabs
- Sidebar uses separate Paper components
- Responsive breakpoints: `{ xs: 12, md: 8, xl: 9 }` + `{ xs: 12, md: 4, xl: 3 }`

**When to use:** Detail pages, entity views with related info sidebar

### Template 3: Dashboard Grid

**Structure:** Header + Controls + Grid container with KPI widgets

**Example:** `dashboard/crm/DashboardLayout.jsx`

**Key features:**
- No Paper wrapper around entire grid
- Individual widget cards have `Paper background={1}`
- KPI cards: `size={{ xs: 12, sm: 6, md: 3 }}` (4-column layout)

**When to use:** Dashboard pages, analytics views, KPI displays

### Template 4: Full-Page App (Kanban/Board)

**Structure:** Custom height calculations, Paper without background prop, SimpleBar for scrolling

**Examples:** `opportunities/index.jsx`, `pipeline/index.jsx`, `kanban/kanban/index.jsx`

**Key features:**
- Uses `mixins.contentHeight()` for dynamic height
- SimpleBar for custom scrolling
- Paper without background prop (custom styling)

**When to use:** Kanban boards, pipeline views, full-page interactive apps

### Template 5: List View with Filters

**Structure:** Paper container with filtering drawer + content area

**Examples:** `products/index.jsx`, `job-list/index.jsx`

**Key features:**
- Uses Container with maxWidth or drawer transitions
- Filter drawer on left, content on right
- Often uses CSS Grid for product/item layout

**When to use:** Product catalogs, job listings, filterable content lists

### Agent Rule

When user requests a new page, identify which template it matches and ask:
**"This looks like a [Template Name]. Should I create it at [path] following that pattern?"**

---

## 5. Agent Workflow Updates

Specific behavioral changes the agent must implement.

### Step 1: ALWAYS Ask First (MANDATORY)

Before creating any file, agent must ask:

```
"Should I create:
A) New page at src/app/(main)/apps/[module]/[feature]/page.jsx
B) New component at src/components/sections/[module]/[feature]/
C) Something else (please specify path)

What are you building?"
```

**No exceptions.** Even if the request seems clear, confirm the path.

### Step 2: Search and Document

After getting user confirmation, search for similar components:

1. Search `src/components/sections/[module]/` for similar features
2. Check `docs/` for documentation
3. Report findings: "Found [X] similar components: [list with similarity ratings]"
4. Propose approach: "I'll duplicate [component] and modify [specific aspects]"

**Document the search in response:**
```
Searched:
- src/components/sections/crm/ → Found AccountDetail (High similarity)
- src/components/sections/ecommerce/ → Found OrderDetail (Medium similarity)

Recommendation: Duplicate AccountDetail and modify for [specific use case]
```

### Step 3: Identify Pattern Category

Determine which pattern applies and announce it:

- "This is a Detail Page with Sidebar → Using Template 2"
- "This is a card grid → Using MUI Grid Pattern with responsive columns"
- "This needs tabs → Paper will have background={1}"

### Step 4: Implementation Checklist

Before writing code, confirm:

- [ ] Correct file path confirmed with user
- [ ] Similar component found and will be duplicated
- [ ] Paper background={1} rule applied correctly
- [ ] Grid/Stack pattern matches use case
- [ ] Responsive padding `p: { xs: 3, md: 5 }` where needed
- [ ] MUI v7 syntax (size prop, not xs/md props)

### Step 5: Verification

After implementation, verify:

- [ ] No horizontal scroll issues (unless intentional carousel)
- [ ] Responsive columns work at all breakpoints (test xs, sm, md, lg, xl)
- [ ] Theme tokens used (no hardcoded colors)
- [ ] MUI v7 syntax throughout
- [ ] Proper import paths (relative imports for local modules)

---

## 6. Available Resources & Tools

The agent has access to these resources and MUST use them during implementation.

### MUI Documentation Index

**Location:** `.claude/mui-doc.txt`

**Purpose:** Complete index of all MUI v7 component documentation with links

**Contains:**
- All component documentation links (Grid, Paper, Stack, etc.)
- Customization guides (theming, dark mode, spacing, breakpoints)
- Integration guides (Next.js, TypeScript)
- Migration guides (v5→v6→v7)

**When to use:** ALWAYS check this first before using any MUI component

### MUI MCP Server (mui-mcp)

**Type:** stdio MCP server

**Purpose:** Interactive component API reference, props documentation, usage examples

**When to use:**
- Need current v7 syntax for complex components
- Verifying prop types and variants
- Getting code examples for DataGrid, Autocomplete, Date Pickers

**Integration:** Available via MCP tool calls during implementation

### Icon Documentation

**Location:** `/documentation/icons`

**Purpose:** Available icon sets, naming conventions, usage patterns

**When to use:**
- Before hardcoding icon names (check IconifyIcon available icons)
- Adding icons to buttons, cards, navigation
- Ensuring consistent icon usage

### Component Documentation

**Location:** `/component-docs/[slug]` (accessible in app)

**Purpose:** PierceDesk custom component documentation

**When to use:**
- Understanding custom base components
- Before creating new shared components

### Theme Documentation

**Location:** `src/theme/` directory

**Files:** `palette/`, `typography.js`, `components/`, `mixins.js`

**When to use:**
- Verifying theme token names (`theme.palette.primary.main`)
- Understanding responsive breakpoints
- Checking component overrides

### Agent Resource Usage Workflow

1. Check `.claude/mui-doc.txt` for relevant MUI component links
2. Use MUI MCP server for detailed API/props if needed
3. Check `/documentation/icons` before adding icons
4. Review `src/theme/` for theme tokens
5. Search existing components in `src/components/` before creating new ones

---

## 7. Common Mistakes to Avoid

Based on codebase analysis and identified issues, here are **critical errors** the agent must avoid.

### Grid & Layout Mistakes

**1. ❌ Using old MUI v5/v6 syntax**

```javascript
// WRONG
<Grid xs={12} md={6}>

// CORRECT
<Grid size={{ xs: 12, md: 6 }}>
```

**2. ❌ Creating horizontal scrolls instead of responsive grids**

- **Problem:** Recent Proposals displaying as horizontal scroll
- **Solution:** Use MUI Grid with responsive columns or CSS Grid auto-fill
- **Example Fix:**
  ```javascript
  // WRONG - Creates horizontal scroll
  <Stack direction="row">

  // CORRECT - Responsive grid
  <Grid container spacing={2}>
    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
  ```

**3. ❌ Using Stack when Grid is needed**

- **When to use Stack:** Simple vertical lists (job list, activity feed)
- **When to use Grid:** Multi-column card layouts with breakpoints

**4. ❌ Missing `container` prop on parent Grid**

```javascript
// WRONG
<Grid spacing={2}>

// CORRECT
<Grid container spacing={2}>
```

### Paper Component Mistakes

**5. ❌ Adding `background={1}` to simple form wrappers**

- Forms, simple content wrappers should NOT have background prop
- Example: add-contact form wrapper is correct WITHOUT background={1}

**6. ❌ Omitting `background={1}` from tab containers**

- Tab panels with TabContext MUST have `Paper background={1}`
- Example: account-detail, contact-detail tab panels

**7. ❌ Omitting `background={1}` from dashboard widgets**

- All dashboard widget cards MUST have `Paper background={1}`
- Example: SaleFunnel, CRMKPIs cards

### Padding & Spacing Mistakes

**8. ❌ Fixed padding instead of responsive**

```javascript
// WRONG
<Paper sx={{ p: 3 }}>

// CORRECT
<Paper sx={{ p: { xs: 3, md: 5 } }}>
```

### Theme & Styling Mistakes

**9. ❌ Hardcoded colors instead of theme tokens**

```javascript
// WRONG
color: '#2196f3'

// CORRECT
color: 'primary.main'
// OR
color: theme.palette.primary.main
```

**10. ❌ ReactEchart without proper height**

```javascript
// WRONG
<ReactEchart option={...} sx={{ minHeight: 200 }} />

// CORRECT
<ReactEchart option={...} sx={{
  height: '100%',
  minHeight: { xs: 200, md: 350 },
  width: 1
}} />
```

### Workflow Mistakes

**11. ❌ Creating files without asking user first**

- ALWAYS ask: page vs component, confirm path
- No assumptions about file location

**12. ❌ Building from scratch without searching**

- MUST search existing components and duplicate
- Document search results before creating

**13. ❌ Not checking mui-doc.txt before using MUI components**

- ALWAYS verify v7 syntax from documentation
- Check MUI MCP server for complex components

---

## 8. Implementation Plan

### Phase 1: Update Agent Instructions

**File:** `.claude/agents/react-mui-frontend-engineer.md`

**Changes:**
1. Add "ALWAYS ASK FIRST" section at top with mandatory question template
2. Add "Paper background={1} Decision Tree" with clear USE/DON'T USE rules
3. Add "Grid Pattern Selection Matrix" with Pattern 1/2/3 decision logic
4. Add "Standard Page Templates" section with 5 template patterns
5. Update "Workflow Checklist" with new verification steps
6. Add "Resource Usage Workflow" section referencing mui-doc.txt, MUI MCP, icons
7. Expand "Common Mistakes" section with all 13 error patterns

### Phase 2: Test Cases

Create test scenarios to verify agent behavior:

1. **Test: Ask Before Creating**
   - Prompt: "Create a user profile settings page"
   - Expected: Agent asks A/B/C question before any file creation

2. **Test: Paper Background Pattern**
   - Prompt: "Create a detail page with tabs"
   - Expected: Tab container Paper has background={1}

3. **Test: Grid Responsive Columns**
   - Prompt: "Create a widget showing recent activities as cards"
   - Expected: MUI Grid with size={{ xs: 12, sm: 6, md: 4 }} pattern

4. **Test: Duplicate Existing Component**
   - Prompt: "Create a lead detail page similar to account detail"
   - Expected: Agent searches, finds account-detail, reports similarity, proposes duplication

5. **Test: Resource Usage**
   - Prompt: "Add an Autocomplete component"
   - Expected: Agent checks mui-doc.txt and MUI MCP server for v7 syntax

### Phase 3: Documentation Updates

Update these related documents:

1. **CLAUDE.md** - Add reference to this design document
2. **Agent workflow docs** - Link to grid/paper pattern sections
3. **Component guidelines** - Reference standard templates

---

## 9. Success Criteria

The agent improvements will be considered successful when:

1. **Zero unsolicited file creation** - Agent always asks before creating files
2. **100% correct Paper usage** - background={1} applied/omitted correctly per rules
3. **Zero horizontal scroll bugs** - All card grids use proper responsive patterns
4. **High duplication rate** - Agent consistently finds and duplicates existing components
5. **Resource-aware** - Agent references mui-doc.txt and MUI MCP before implementation

---

## 10. Rollout Plan

1. **Update agent file** - Implement all changes to `.claude/agents/react-mui-frontend-engineer.md`
2. **Test with simple tasks** - Verify ask-first behavior and Paper rules
3. **Test with complex tasks** - Verify Grid patterns and template selection
4. **Monitor initial usage** - Watch for any remaining pattern issues
5. **Iterate as needed** - Adjust rules based on real-world usage

---

## Appendix A: Pattern Quick Reference

### Paper background={1} Quick Check

```
Does this Paper contain TabContext/Tabs? → YES → background={1}
Is this a dashboard widget card? → YES → background={1}
Is this a simple form wrapper? → YES → NO background prop
Is this a kanban/board layout? → YES → NO background prop (custom styling)
```

### Grid Pattern Quick Check

```
Need specific columns per breakpoint? → MUI Grid Pattern 1
Need flexible auto-fill card grid? → CSS Grid Pattern 2
Need simple vertical list? → Stack Pattern 3
```

### Template Quick Check

```
Simple form with stepper? → Template 1
Detail page with sidebar? → Template 2
Dashboard with KPI widgets? → Template 3
Kanban/board full-page? → Template 4
List with filters/drawer? → Template 5
```

---

**End of Design Document**
