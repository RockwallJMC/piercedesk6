# CRM Section - Database Wiring Brainstorm

**Created:** 2026-01-30
**Type:** Brainstorm Document
**Section:** CRM (Phase 1.1)
**Status:** Complete

## Overview

Comprehensive analysis of CRM section for database wiring audit and completion. The CRM section has evolved beyond the Aurora template with additional entities (accounts, contacts lists, proposals, forecasting). Database infrastructure already exists with 7 tables and Supabase connections. The goal is to audit existing wiring, complete any missing connections, and ensure full CRUD functionality across all pages.

## Section Inventory

**Total Pages:** 17 pages across 4 complexity types

### Existing Database Tables (Supabase Cloud)
1. `leads` - Lead management with RLS
2. `contacts` - Contact management with RLS
3. `accounts` - Account/company management with RLS
4. `opportunities` - Sales opportunities/deals with RLS
5. `proposals` - Proposal management with RLS
6. `proposal_line_items` - Line items for proposals
7. `organization_members` - Team/org membership

### Existing Service Hooks (SWR)
- `useLeadApi.js` - Leads CRUD operations
- `useContactApi.js` - Contacts CRUD operations
- `useAccountApi.js` - Accounts CRUD operations
- `useOpportunitiesApi.js` - Opportunities CRUD operations
- `useProposalApi.js` - Proposals CRUD operations

## Page Categorization by Type

### LIST PAGES (Phase 1.1.1) - 6 pages

#### 1. Leads List (`/apps/crm/leads`)
**Page:** `src/app/(main)/apps/crm/leads/page.jsx`
**Component:** `src/components/sections/crm/leads-list/LeadsListContainer.jsx`
**Current State:** ✅ **Already wired to database**
- Uses `useLeads()` hook from `useLeadApi.js`
- Fetches from `leads` table via Supabase client
- Has status filtering (new, contacted, qualified, unqualified, converted)
- Has search functionality
- Uses DataGrid for display

**Mock Data Mapping:**
- Mock: Previously used static lead data
- Real: `leads` table columns:
  - id (UUID)
  - organization_id (UUID) - multi-tenancy
  - status (enum)
  - name, email, phone, company
  - created_at, updated_at, deleted_at

**API Endpoints:**
- GET via Supabase: `.from('leads').select('*')`
- Filtered by organization via RLS

**RLS Policies Required:**
- ✅ Already implemented: Org isolation via RLS
- Users can only see leads in their organization

**Test Scenarios:**
- Data layer: Query leads table, verify RLS filters by org
- API layer: Verify useLeads() returns only org's leads
- UI layer: Verify table renders, search works, filters work
- E2E: Load page → see leads → filter → search → click lead

**Status:** ✅ COMPLETE - Already fully wired

#### 2. Contacts List (`/apps/crm/contacts`)
**Page:** `src/app/(main)/apps/crm/contacts/page.jsx`
**Component:** `src/components/sections/crm/contacts-list/` (to verify)
**Current State:** ⚠️ **Needs verification**

**Expected Database Schema:**
- Table: `contacts`
- Columns: id, organization_id, first_name, last_name, email, phone, account_id, position, created_at, updated_at

**API Endpoints Needed:**
- GET /api/crm/contacts (or via Supabase direct)
- Hook: `useContacts()` from `useContactApi.js`

**RLS Policies Required:**
- Organization isolation
- User can SELECT/INSERT/UPDATE/DELETE contacts in their org

**Test Scenarios:**
- Data: contacts table exists, RLS works
- API: useContacts() returns contacts
- UI: Table renders, search/filter works
- E2E: User loads contacts list, sees data, can interact

**Status:** ⚠️ NEEDS AUDIT

#### 3. Accounts List (`/apps/crm/accounts`)
**Page:** `src/app/(main)/apps/crm/accounts/page.jsx`
**Component:** `src/components/sections/crm/accounts-list/` (to verify)
**Current State:** ⚠️ **Needs verification**

**Expected Database Schema:**
- Table: `accounts`
- Columns: id, organization_id, name, industry, website, phone, address, created_at, updated_at

**API Endpoints Needed:**
- GET via Supabase: `.from('accounts').select('*')`
- Hook: `useAccounts()` from `useAccountApi.js`

**RLS Policies Required:**
- Organization isolation on accounts table

**Test Scenarios:**
- Data: accounts table, RLS works
- API: useAccounts() fetches data
- UI: List renders
- E2E: Full user flow

**Status:** ⚠️ NEEDS AUDIT

#### 4. Opportunities List (`/apps/crm/opportunities`)
**Page:** `src/app/(main)/apps/crm/opportunities/page.jsx`
**Component:** `src/components/sections/crm/opportunities/OpportunitiesKanban.jsx`
**Current State:** ⚠️ **Needs verification - Kanban board**

**Database Schema:**
- Table: `opportunities`
- Columns: id, organization_id, name, account_id, stage, value, probability, close_date, owner_id, created_at, updated_at

**Kanban Specifics:**
- Drag-and-drop functionality (uses `@dnd-kit`)
- Stages/columns: Prospecting, Qualification, Proposal, Negotiation, Closed Won, Closed Lost
- Cards represent opportunities
- Real-time updates on stage changes

**API Endpoints Needed:**
- GET opportunities: `useOpportunities()`
- UPDATE stage: Need mutation hook for drag-drop
- CREATE opportunity: Need create modal wiring

**RLS Policies Required:**
- Org isolation
- Stage updates require ownership check

**Test Scenarios:**
- Data: opportunities table, stages enum
- API: Fetch opportunities, update stage
- UI: Kanban renders, drag-drop works
- E2E: Load board → drag card → verify stage updated in DB

**Status:** ⚠️ NEEDS AUDIT (complex - Kanban)

#### 5. Opportunities List (alternate) (`/apps/crm/opportunities/list`)
**Page:** `src/app/(main)/apps/crm/opportunities/list/page.jsx`
**Current State:** ⚠️ **Possible duplicate of #4?**

**Action Required:**
- Determine if this is table view vs Kanban view
- If duplicate, remove or clarify purpose

**Status:** ⚠️ NEEDS INVESTIGATION

#### 6. Proposals List (`/apps/crm/proposals`)
**Page:** `src/app/(main)/apps/crm/proposals/page.jsx`
**Component:** `src/components/sections/crm/proposals-list/` (to verify)
**Current State:** ⚠️ **Needs verification**

**Database Schema:**
- Table: `proposals`
- Columns: id, organization_id, opportunity_id, title, status, total_amount, valid_until, created_at, updated_at
- Related: `proposal_line_items` (id, proposal_id, description, quantity, unit_price, total)

**API Endpoints Needed:**
- GET proposals: `useProposals()` from `useProposalApi.js`
- Should include line items?

**RLS Policies Required:**
- Org isolation on both proposals and proposal_line_items

**Test Scenarios:**
- Data: Both tables, RLS works
- API: Fetch proposals with line items
- UI: List renders
- E2E: User workflow

**Status:** ⚠️ NEEDS AUDIT

---

### CREATE/EDIT PAGES (Phase 1.1.2) - To be determined

#### 7. Add Contact (`/apps/crm/add-contact`)
**Page:** `src/app/(main)/apps/crm/add-contact/page.jsx`
**Component:** `src/components/sections/crm/add-contact/index.jsx`
**Current State:** ⚠️ **Form exists - needs wiring audit**

**Form Structure:**
- Multi-step stepper (from Aurora template)
- Steps: Personal Info, Company Info, Lead Info
- Fields: name, email, phone, company, position, etc.

**Database Operations:**
- INSERT into `contacts` table
- Should also create related `account` if new company?
- Should create related `lead` entry?

**API Endpoints Needed:**
- POST /api/crm/contacts (or Supabase mutation)
- Hook: `useCreateContact()` mutation from `useContactApi.js`

**Validation:**
- Email format
- Required fields
- Duplicate contact check?

**Test Scenarios:**
- Data: Can insert into contacts table
- API: Mutation succeeds, returns new contact
- UI: Form validates, shows errors, submits
- E2E: Fill form → submit → verify in database → see in contacts list

**Status:** ⚠️ NEEDS WIRING AUDIT

#### Missing Create/Edit Forms (TO BE ADDED):
- ❌ Add Lead (create form for leads)
- ❌ Add Account (create form for accounts)
- ❌ Add Opportunity (create form for opportunities)
- ❌ Add Proposal (create form for proposals)
- ❌ Edit Lead (edit existing lead)
- ❌ Edit Contact (edit existing contact)
- ❌ Edit Account (edit existing account)
- ❌ Edit Opportunity (edit existing opportunity)
- ❌ Edit Proposal (edit existing proposal)

**Decision needed:** Should we add all missing CRUD forms, or are they out of scope for this phase?

---

### DETAIL/INTERACTION PAGES (Phase 1.1.3) - 7 pages

#### 8. Lead Detail (`/apps/crm/leads/[id]`)
**Page:** `src/app/(main)/apps/crm/leads/[id]/page.jsx`
**Component:** `src/components/sections/crm/lead-detail/` (to verify)
**Current State:** ⚠️ **Needs verification**

**Database Operations:**
- GET single lead by ID: `useLeads(id)` or `useLead(id)`
- Related data: activities, notes, deals?

**API Endpoints Needed:**
- GET /api/crm/leads/:id
- Hook: `useLead(id)` with proper Supabase query

**RLS Policies:**
- User can only view leads in their org

**Page Sections:**
- Lead information panel
- Contact details
- Activity timeline
- Associated deals/opportunities
- Convert to contact/account action

**Test Scenarios:**
- Data: Fetch lead by ID
- API: useLead(id) returns correct lead
- UI: Page renders lead details
- E2E: Click lead from list → see detail page

**Status:** ⚠️ NEEDS AUDIT

#### 9. Lead Details (legacy?) (`/apps/crm/lead-details`)
**Page:** `src/app/(main)/apps/crm/lead-details/page.jsx`
**Current State:** ⚠️ **Possible duplicate of #8 or static example page?**

**Action Required:**
- Determine if this is legacy/example or actual functionality
- If duplicate, remove
- If different purpose, clarify

**Status:** ⚠️ NEEDS INVESTIGATION

#### 10. Contact Detail (`/apps/crm/contacts/[id]`)
**Page:** `src/app/(main)/apps/crm/contacts/[id]/page.jsx`
**Current State:** ⚠️ **Needs verification**

**Database Operations:**
- GET single contact by ID
- Related: account, activities, opportunities

**API Endpoints:**
- GET via Supabase: `.from('contacts').select('*, accounts(*)').eq('id', id)`
- Hook: `useContact(id)`

**Page Sections:**
- Contact information
- Associated account
- Activity history
- Related opportunities/proposals

**Test Scenarios:**
- Data: Fetch contact with joins
- API: useContact(id) with relations
- UI: All sections render
- E2E: Navigate from contacts list

**Status:** ⚠️ NEEDS AUDIT

#### 11. Account Detail (`/apps/crm/accounts/[id]`)
**Page:** `src/app/(main)/apps/crm/accounts/[id]/page.jsx`
**Component:** `src/components/sections/crm/account-detail/index.jsx`
**Current State:** ⚠️ **Needs verification**

**Database Operations:**
- GET account by ID
- Related: contacts at this account, opportunities, proposals

**API Endpoints:**
- GET with relations
- Hook: `useAccount(id)` with joins

**Page Sections (likely tabs):**
- Overview - account details
- Contacts - list of contacts at this account
- Opportunities - active deals
- Activity - timeline

**Test Scenarios:**
- Data: Complex query with multiple joins
- API: useAccount(id) returns full data
- UI: Tabs render, data displays
- E2E: Full navigation flow

**Status:** ⚠️ NEEDS AUDIT

#### 12. Opportunity Detail (`/apps/crm/opportunities/[id]`)
**Page:** `src/app/(main)/apps/crm/opportunities/[id]/page.jsx`
**Component:** `src/components/sections/crm/opportunity-details/` (to verify)
**Current State:** ⚠️ **Needs verification**

**Database Operations:**
- GET opportunity by ID
- Related: account, contact, activities, proposals

**API Endpoints:**
- GET with complex joins
- Hook: `useOpportunity(id)`

**Page Sections:**
- Opportunity information
- Sales pipeline stage
- Associated account/contact
- Activity monitoring
- Analytics
- Proposals linked to this opportunity

**Test Scenarios:**
- Data: Multi-table join query
- API: Full data fetching
- UI: All widgets/sections render
- E2E: Navigate from opportunities board

**Status:** ⚠️ NEEDS AUDIT

#### 13. Deal Details (`/apps/crm/opportunities/deal-details`)
**Page:** `src/app/(main)/apps/crm/opportunities/deal-details/page.jsx`
**Current State:** ⚠️ **Static route or dynamic? Clarify relationship to #12**

**Action Required:**
- Is this a static example/demo page?
- Or is this the same as `/opportunities/[id]`?
- Clarify routing structure

**Status:** ⚠️ NEEDS INVESTIGATION

#### 14. Proposal Detail (`/apps/crm/proposals/[id]`)
**Page:** `src/app/(main)/apps/crm/proposals/[id]/page.jsx`
**Current State:** ⚠️ **Needs verification**

**Database Operations:**
- GET proposal by ID
- Related: opportunity, line items, account

**API Endpoints:**
- GET with line items: `.from('proposals').select('*, proposal_line_items(*), opportunities(*, accounts(*))').eq('id', id)`
- Hook: `useProposal(id)`

**Page Sections:**
- Proposal header (title, status, dates)
- Line items table
- Totals/calculations
- Linked opportunity/account
- Actions: Edit, Send, Convert to PDF?

**Test Scenarios:**
- Data: Proposal with line items
- API: Complex query works
- UI: PDF-like view renders
- E2E: View proposal, verify calculations

**Status:** ⚠️ NEEDS AUDIT

---

### DASHBOARD/COMPLEX PAGES (Phase 1.1.4) - 3 pages

#### 15. CRM Dashboard - Main (`/dashboard/crm`)
**Page:** `src/app/(main)/dashboard/crm/page.jsx`
**Component:** `src/components/sections/dashboards/crm/index.jsx`
**Current State:** ⚠️ **Complex dashboard - needs verification**

**Dashboard Widgets (from Aurora template):**
1. CRM KPIs - Key metrics cards
2. Generated Revenue - Chart
3. Active Users - Chart
4. Customer Acquisition Cost - Chart
5. Average Lifetime Value - Chart
6. Customer Feedback - Chart/ratings
7. Lead Sources - Pie chart
8. Sales Funnel - Funnel visualization

**Database Operations:**
- Multiple aggregate queries across tables
- Date range filtering
- Metrics calculations

**API Endpoints Needed:**
- GET /api/crm/metrics (aggregated data)
- Hook: `useCRMDashboard()` or `useDashboardApi.js`
- Each widget might need separate query

**Aggregation Examples:**
```sql
-- Total revenue from won opportunities
SELECT SUM(value) FROM opportunities
WHERE organization_id = $1 AND stage = 'closed_won'

-- Lead conversion rate
SELECT
  COUNT(*) FILTER (WHERE status = 'converted') * 100.0 / COUNT(*)
FROM leads
WHERE organization_id = $1

-- Opportunities by stage (sales funnel)
SELECT stage, COUNT(*), SUM(value)
FROM opportunities
WHERE organization_id = $1
GROUP BY stage
```

**Test Scenarios:**
- Data: Aggregate queries return correct data
- API: Dashboard hooks fetch all metrics
- UI: All widgets render with real data
- E2E: Dashboard loads, widgets show data, filters work

**Status:** ⚠️ NEEDS AUDIT (complex aggregations)

#### 16. CRM App Dashboard (`/apps/crm/dashboard`)
**Page:** `src/app/(main)/apps/crm/dashboard/page.jsx`
**Component:** `src/components/sections/crm/dashboard/DashboardLayout.jsx`
**Current State:** ⚠️ **Separate from main dashboard? Verify purpose**

**Notes from file:**
- Phase 1.7.1: Core infrastructure with placeholder widgets
- Actual widget implementations in Phases 1.7.2-1.7.5
- Uses `CRMDashboardProvider`

**Action Required:**
- Determine if this is different from /dashboard/crm
- What's the intended difference?
- Is this meant to be wired or is it still placeholder?

**Status:** ⚠️ NEEDS INVESTIGATION

#### 17. Opportunities Forecast (`/apps/crm/opportunities/forecast`)
**Page:** `src/app/(main)/apps/crm/opportunities/forecast/page.jsx`
**Component:** `src/components/sections/crm/opportunities-forecast/ForecastingDashboard.jsx`
**Current State:** ⚠️ **Complex forecasting - needs verification**

**Forecast Features:**
- Sales pipeline forecast
- Weighted opportunity values (value × probability)
- Time-based projections
- Revenue predictions by month/quarter
- Win/loss analysis

**Database Operations:**
- GET opportunities with probability calculations
- Group by close_date
- Calculate weighted totals

**API Endpoints:**
- Hook: `useOpportunities()` with forecast calculations
- Client-side or server-side aggregation?

**Calculations:**
```javascript
// Weighted forecast value
opportunity.value * (opportunity.probability / 100)

// Group by month
opportunities.reduce((acc, opp) => {
  const month = format(opp.close_date, 'YYYY-MM')
  acc[month] = (acc[month] || 0) + (opp.value * opp.probability / 100)
  return acc
}, {})
```

**Test Scenarios:**
- Data: Opportunities with probabilities
- API: Fetch and calculate forecasts
- UI: Charts render, projections display
- E2E: View forecast, verify calculations match expectations

**Status:** ⚠️ NEEDS AUDIT (complex calculations)

---

## Database Schema Summary

### Confirmed Tables

**leads**
```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  status VARCHAR CHECK (status IN ('new', 'contacted', 'qualified', 'unqualified', 'converted')),
  name VARCHAR NOT NULL,
  email VARCHAR,
  phone VARCHAR,
  company VARCHAR,
  source VARCHAR,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);
-- RLS: organization_id = current_org()
```

**contacts**
```sql
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  account_id UUID REFERENCES accounts(id),
  first_name VARCHAR,
  last_name VARCHAR,
  email VARCHAR,
  phone VARCHAR,
  position VARCHAR,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
-- RLS: organization_id = current_org()
```

**accounts**
```sql
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name VARCHAR NOT NULL,
  industry VARCHAR,
  website VARCHAR,
  phone VARCHAR,
  address JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
-- RLS: organization_id = current_org()
```

**opportunities**
```sql
CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  account_id UUID REFERENCES accounts(id),
  contact_id UUID REFERENCES contacts(id),
  name VARCHAR NOT NULL,
  stage VARCHAR CHECK (stage IN ('prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
  value DECIMAL(10,2),
  probability INTEGER CHECK (probability BETWEEN 0 AND 100),
  close_date DATE,
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
-- RLS: organization_id = current_org()
```

**proposals**
```sql
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  opportunity_id UUID REFERENCES opportunities(id),
  title VARCHAR NOT NULL,
  status VARCHAR CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'rejected')),
  total_amount DECIMAL(10,2),
  valid_until DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
-- RLS: organization_id = current_org()
```

**proposal_line_items**
```sql
CREATE TABLE proposal_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  description TEXT,
  quantity INTEGER,
  unit_price DECIMAL(10,2),
  total DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  sort_order INTEGER
);
-- RLS: Via proposal_id join to proposals table
```

### Seed Data Requirements

For testing, each table needs seed data:
- **leads**: 20-30 leads across different statuses and orgs
- **contacts**: 15-20 contacts linked to accounts
- **accounts**: 10-15 companies
- **opportunities**: 10-15 opportunities across different stages
- **proposals**: 5-10 proposals with line items
- **proposal_line_items**: 20-30 line items across proposals

---

## Implementation Strategy

### Phase 1.1.1: List Pages (Estimated: 2-3 hours)
**Goal:** Verify and complete all 6 list pages

**Pages to audit:**
1. ✅ Leads List - Already wired (verify only)
2. ⚠️ Contacts List - Audit wiring
3. ⚠️ Accounts List - Audit wiring
4. ⚠️ Opportunities Kanban - Audit wiring (complex)
5. ⚠️ Opportunities List (alternate) - Investigate if duplicate
6. ⚠️ Proposals List - Audit wiring

**For each page:**
- Verify service hook exists and works
- Verify component uses hook correctly
- Check for mock data remnants
- Ensure search/filter uses real queries
- Add seed data if missing
- Test data/API/UI/E2E

**Deliverables:**
- All list pages fetch from database
- All hooks properly configured
- All RLS policies verified
- Seed data present for testing
- Tests passing for all list pages

### Phase 1.1.2: Create/Edit Forms (Estimated: 4-6 hours)
**Goal:** Wire existing form and identify missing CRUD

**Existing:**
1. Add Contact - Audit and wire

**Missing (decision needed):**
- Add Lead form
- Add Account form
- Add Opportunity form
- Add Proposal form
- Edit forms for all entities

**For add-contact:**
- Verify form validation
- Wire to `useCreateContact()` mutation
- Handle success/error states
- Redirect after creation
- Test full flow

**Decision point:** Should we add all missing forms or defer?

**Deliverables:**
- Add Contact form fully functional
- Decision documented on missing forms
- If adding missing forms: all entity create forms working

### Phase 1.1.3: Detail/Interaction Pages (Estimated: 5-7 hours)
**Goal:** Wire all 7 detail pages with full data

**Pages:**
1. Lead Detail
2. Lead Details (investigate/remove if duplicate)
3. Contact Detail
4. Account Detail
5. Opportunity Detail
6. Deal Details (investigate/clarify)
7. Proposal Detail

**For each:**
- Create or verify `use[Entity](id)` hook
- Implement complex queries with joins
- Wire all page sections/tabs
- Add edit capability (modal or inline)
- Test data/API/UI/E2E

**Deliverables:**
- All detail pages show full data from database
- Related entities displayed correctly
- Edit functionality works
- Tests passing

### Phase 1.1.4: Dashboard/Complex Pages (Estimated: 6-8 hours)
**Goal:** Wire dashboards with aggregate data

**Pages:**
1. CRM Dashboard (main) - Multiple widgets
2. CRM App Dashboard - Clarify vs main dashboard
3. Opportunities Forecast - Complex calculations

**For dashboards:**
- Create aggregate query hooks
- Wire each widget to real data
- Implement date range filtering
- Handle loading/error states
- Optimize performance (caching, memoization)
- Test calculations accuracy

**Deliverables:**
- All dashboard widgets show real data
- Aggregations correct
- Performance acceptable
- Tests verify calculations

---

## Technical Considerations

### RLS Policy Patterns
All tables use organization-based isolation:
```sql
CREATE POLICY "org_isolation" ON table_name
  FOR ALL
  USING (organization_id = auth.jwt()->>'organization_id');
```

### Service Hook Patterns
Standard SWR hook structure:
```javascript
export const useEntities = (filters = {}) => {
  const { data, error, isLoading } = useSWR(
    ['entities', filters],
    () => entitiesFetcher(filters)
  )
  return { data, error, isLoading }
}

export const useCreateEntity = () => {
  return useSWRMutation('entities', createEntityMutator)
}
```

### Error Handling
- Network errors
- RLS policy violations (403)
- Not found (404)
- Validation errors (400)

### Loading States
- Skeleton loaders for lists
- Spinner for forms
- Progressive loading for dashboards

### Data Refresh
- SWR automatic revalidation
- Manual refresh triggers
- Optimistic updates for mutations

---

## Testing Strategy

### Data Layer Tests
- Table queries work
- RLS policies enforce org isolation
- Seed data is queryable
- Complex joins return correct data

### API Layer Tests
- Hooks return data
- Mutations succeed
- Error handling works
- Filters/pagination work

### UI Layer Tests
- Components render with data
- Loading states display
- Error states display
- User interactions work

### E2E Integration Tests
- Full user workflows
- CRUD operations end-to-end
- Navigation between pages
- Data consistency

---

## Risks & Mitigations

**Risk:** Some pages might still use mock data providers
**Mitigation:** Thorough audit of each component, search for mock data imports

**Risk:** Complex aggregations might be slow
**Mitigation:** Database indexes, query optimization, client-side caching

**Risk:** Kanban drag-drop might not persist to database
**Mitigation:** Verify mutation hooks exist for stage updates

**Risk:** Missing RLS policies could leak data across orgs
**Mitigation:** Test with multiple org users, verify isolation

**Risk:** Incomplete CRUD - missing edit/delete functionality
**Mitigation:** Document gaps, decide scope for this phase

---

## Success Criteria

✅ **Phase 1.1.1 Complete When:**
- All 6 list pages fetch from database
- Search/filter works on real data
- Tests pass for data/API/UI/E2E
- No mock data remains

✅ **Phase 1.1.2 Complete When:**
- Add Contact form creates database records
- Decision documented on missing forms
- Tests pass for form submission

✅ **Phase 1.1.3 Complete When:**
- All 7 detail pages show database data
- Related entities display correctly
- Edit functionality works
- Tests pass

✅ **Phase 1.1.4 Complete When:**
- All dashboard widgets show real data
- Aggregations accurate
- Forecast calculations correct
- Tests pass

✅ **Overall Section Complete When:**
- All 17 pages fully wired
- All tests passing
- Build succeeds
- Lint clean
- Documentation updated

---

## Next Steps

After brainstorming approval:
1. Create Section INDEX: `docs/system/INDEX-crm-section.md`
2. Create feature branch: `feature/desk-crm-database-wiring`
3. Create Phase 1.1.1 plan: `docs/system/plans/plan-2026-01-30-crm-list-pages.md`
4. Create GitHub issue for Phase 1.1.1
5. Begin sequential execution: supabase → wiring → react-mui per page

---

**Brainstorm Status:** ✅ Complete
**Ready for:** Section INDEX creation and feature branch setup
