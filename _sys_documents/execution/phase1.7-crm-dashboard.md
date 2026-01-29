---
phase: "1.7"
title: "CRM Dashboard & Reports - Implementation"
type: "execution"
status: "planned"
version: "0.1"
created: "2026-01-27"
updated: "2026-01-27"
assigned_agent: "react-mui-frontend-engineer"
dependencies: ["phase1.2-auth-system", "phase1.3-accounts-contacts", "phase1.4-leads-management", "phase1.5-opportunity-pipeline"]
progress_percentage: 0
estimated_completion: "2026-03-07"
---

# Phase 1.7: CRM Dashboard & Reports - Implementation

## Executive Summary

Phase 1.7 creates a comprehensive CRM dashboard that provides real-time insights into the complete sales pipeline. This phase integrates data from all previous CRM phases (1.3-1.5) into a unified dashboard with key performance indicators, forecasting widgets, and activity monitoring.

**Key Deliverables:**
- Enhanced CRM Dashboard with real data integration
- Pipeline Performance Widgets (total value, weighted forecast, conversion rates)
- Recent Activities Timeline (Digital Thread foundation)
- Top Opportunities by Value widget
- Lead Source Performance analytics
- Real-time KPI calculations
- Responsive dashboard layout with Aurora styling
- 25+ E2E tests for dashboard functionality

**Business Value:**
- Executive visibility into sales performance
- Real-time pipeline health monitoring
- Data-driven decision making capabilities
- Foundation for advanced reporting (post-MVP)
- Digital Thread activity visualization

**Strategy:**
- Leverage existing Aurora CRM dashboard components
- Integrate with SWR hooks from Phases 1.3-1.5
- Mock data first, Supabase integration after Phase 1.2
- Maintain Aurora design system consistency

---

## Current State

**Completed Dependencies:**
- ✅ Phase 1.1: Database schema with activities, leads, opportunities, accounts, contacts tables
- ✅ Phase 1.3: Accounts & Contacts UI with useAccountApi, useContactApi hooks
- ✅ Phase 1.4: Leads Management with useLeadApi hooks
- ✅ Phase 1.5: Opportunity Pipeline with useOpportunitiesApi hooks

**In Progress:**
- 🚧 Phase 1.2: Auth & Multi-Tenancy (60% complete) - blocks Supabase integration

**Foundation Available:**
- ✅ Complete Aurora CRM dashboard at `/dashboard/crm`
- ✅ CRMGreeting, CRMKPIs, CRMGeneratedRevenue, LeadSources, SaleFunnel components
- ✅ Mock data structure in `data/crm/dashboard.js`
- ✅ Responsive Grid layout with Material-UI v7
- ✅ Chart components (ReactEchart integration)

**Data Sources Available:**
- ✅ useAccountApi: 5 hooks (accounts list, detail, create, update, delete)
- ✅ useContactApi: 8 hooks (contacts with account linking)
- ✅ useLeadApi: 6 hooks (leads with conversion tracking)
- ✅ useOpportunitiesApi: 6 hooks (opportunities with forecasting)
- ✅ Mock data: 12 accounts, 20 contacts, 15 leads, 17 opportunities

---

## Implementation Plan

### Step 1: Create Dashboard Data Integration Layer ⏳ PLANNED

**Duration**: 2-3 hours
**Status**: ⏳ Planned
**Assigned**: react-mui-frontend-engineer

**File to create**: `src/services/dashboard/crmDashboardService.js`

**Purpose**: Centralized service to aggregate data from all CRM APIs for dashboard widgets

**Functions to implement:**
```javascript
// Pipeline metrics
export const calculatePipelineMetrics = (opportunities) => ({
  totalPipeline: number,
  weightedForecast: number,
  avgOpportunitySize: number,
  totalOpportunities: number
});

// Conversion rates
export const calculateConversionRates = (leads, opportunities) => ({
  leadToOpportunity: percentage,
  opportunityToWon: percentage,
  overallConversion: percentage
});

// Recent activities aggregation
export const getRecentActivities = (accounts, contacts, leads, opportunities) => [
  { type, entity, action, timestamp, user }
];

// Top opportunities
export const getTopOpportunities = (opportunities, limit = 5) => [
  { id, name, value, probability, account, stage }
];

// Lead source performance
export const calculateLeadSourcePerformance = (leads) => [
  { source, count, conversionRate, totalValue }
];
```

**Requirements:**
- Pure functions for easy testing
- Handle empty/null data gracefully
- Follow existing calculation patterns from Phase 1.5
- TODO markers for real-time calculations after Phase 1.2

### Step 2: Enhance CRM Greeting Widget ⏳ PLANNED

**Duration**: 1-2 hours
**Status**: ⏳ Planned
**Assigned**: react-mui-frontend-engineer

**File to modify**: `src/components/sections/dashboards/crm/CRMGreeting.jsx`

**Current state**: Uses mock `dealsData` prop
**Target state**: Integrate with real opportunities data

**Changes:**
1. Replace `dealsData` prop with `useOpportunities()` hook
2. Calculate real metrics:
   - Total deals this month
   - Won deals this month  
   - Pipeline value
   - Month-over-month growth
3. Add loading state during data fetch
4. Handle empty state gracefully
5. Add TODO marker for real-time updates

**Integration pattern:**
```javascript
const CRMGreeting = () => {
  const { data: opportunities, isLoading } = useOpportunities();
  
  const metrics = useMemo(() => 
    calculateGreetingMetrics(opportunities), [opportunities]
  );
  
  // TODO: Replace with real-time subscription after Phase 1.2
  // const { data: realtimeMetrics } = useRealtimePipelineMetrics();
  
  return (
    // Existing greeting layout with real data
  );
};
```

### Step 3: Update CRM KPIs Widget ⏳ PLANNED

**Duration**: 2-3 hours
**Status**: ⏳ Planned
**Assigned**: react-mui-frontend-engineer

**File to modify**: `src/components/sections/dashboards/crm/kpi/CRMKPIs.jsx`

**Current state**: Uses mock `kpisData` prop
**Target state**: Real KPIs from integrated CRM data

**KPIs to implement:**
1. **Total Pipeline Value**: Sum of all open opportunities
2. **Weighted Forecast**: Sum of (value × probability) for open opportunities
3. **Conversion Rate**: (Won opportunities / Total opportunities) × 100
4. **Average Deal Size**: Total won value / Won opportunities count

**Data integration:**
```javascript
const CRMKPIs = () => {
  const { data: opportunities } = useOpportunities();
  const { data: leads } = useLeads();
  
  const kpis = useMemo(() => ({
    totalPipeline: calculatePipelineMetrics(opportunities).totalPipeline,
    weightedForecast: calculatePipelineMetrics(opportunities).weightedForecast,
    conversionRate: calculateConversionRates(leads, opportunities).overallConversion,
    avgDealSize: calculatePipelineMetrics(opportunities).avgOpportunitySize
  }), [opportunities, leads]);
  
  return (
    // Existing KPI cards with real data
  );
};
```

### Step 4: Create Recent Activities Widget ⏳ PLANNED

**Duration**: 3-4 hours
**Status**: ⏳ Planned
**Assigned**: react-mui-frontend-engineer

**Files to create:**
- `src/components/sections/dashboards/crm/recent-activities/RecentActivities.jsx`
- `src/components/sections/dashboards/crm/recent-activities/ActivityItem.jsx`
- `src/components/sections/dashboards/crm/recent-activities/ActivityTimeline.jsx`

**Purpose**: Display recent CRM activities across all entities (Digital Thread foundation)

**Activity types to track:**
- Lead created/updated/converted
- Opportunity created/stage changed/won/lost
- Account created/updated
- Contact created/linked/unlinked

**Component structure:**
```javascript
const RecentActivities = () => {
  const { data: accounts } = useAccounts();
  const { data: contacts } = useContacts();
  const { data: leads } = useLeads();
  const { data: opportunities } = useOpportunities();
  
  const activities = useMemo(() => 
    getRecentActivities(accounts, contacts, leads, opportunities)
      .slice(0, 10), // Show last 10 activities
    [accounts, contacts, leads, opportunities]
  );
  
  return (
    <Card>
      <CardHeader title="Recent Activities" />
      <CardContent>
        <ActivityTimeline activities={activities} />
      </CardContent>
    </Card>
  );
};
```

**Features:**
- Timeline layout with icons and timestamps
- Click to navigate to entity detail page
- Real-time updates (TODO marker for Phase 1.2)
- Responsive design

### Step 5: Create Top Opportunities Widget ⏳ PLANNED

**Duration**: 2-3 hours
**Status**: ⏳ Planned
**Assigned**: react-mui-frontend-engineer

**Files to create:**
- `src/components/sections/dashboards/crm/top-opportunities/TopOpportunities.jsx`
- `src/components/sections/dashboards/crm/top-opportunities/OpportunityListItem.jsx`

**Purpose**: Display highest-value opportunities in the pipeline

**Features:**
- Show top 5 opportunities by value
- Display: name, account, value, probability, stage
- Progress bar for probability
- Click to navigate to opportunity detail
- Stage color coding

**Component structure:**
```javascript
const TopOpportunities = () => {
  const { data: opportunities } = useOpportunities();
  
  const topOpportunities = useMemo(() => 
    getTopOpportunities(opportunities, 5), [opportunities]
  );
  
  return (
    <Card>
      <CardHeader 
        title="Top Opportunities" 
        action={<Button href="/apps/crm/opportunities">View All</Button>}
      />
      <CardContent>
        {topOpportunities.map(opportunity => (
          <OpportunityListItem key={opportunity.id} opportunity={opportunity} />
        ))}
      </CardContent>
    </Card>
  );
};
```

### Step 6: Enhance Lead Sources Widget ⏳ PLANNED

**Duration**: 2-3 hours
**Status**: ⏳ Planned
**Assigned**: react-mui-frontend-engineer

**File to modify**: `src/components/sections/dashboards/crm/lead-sources/LeadSources.jsx`

**Current state**: Uses mock data
**Target state**: Real lead source performance data

**Enhancements:**
1. Integrate with `useLeads()` hook
2. Calculate real lead source metrics:
   - Count by source
   - Conversion rate by source
   - Total value generated by source
3. Update chart data with real values
4. Add click-through to filtered leads list

**Data integration:**
```javascript
const LeadSources = () => {
  const { data: leads } = useLeads();
  
  const sourcePerformance = useMemo(() => 
    calculateLeadSourcePerformance(leads), [leads]
  );
  
  const chartData = sourcePerformance.map(source => ({
    name: source.source,
    value: source.count,
    conversionRate: source.conversionRate
  }));
  
  return (
    // Existing chart with real data
  );
};
```

### Step 7: Update Sales Funnel Widget ⏳ PLANNED

**Duration**: 2-3 hours
**Status**: ⏳ Planned
**Assigned**: react-mui-frontend-engineer

**File to modify**: `src/components/sections/dashboards/crm/sale-funnel/SaleFunnel.jsx`

**Current state**: Uses mock funnel data
**Target state**: Real conversion funnel from leads to won opportunities

**Funnel stages:**
1. **Leads**: Total leads count
2. **Qualified**: Leads with status 'qualified'
3. **Opportunities**: Converted leads (opportunities count)
4. **Proposals**: Opportunities in 'proposal' stage (Phase 1.6 integration)
5. **Won**: Opportunities with status 'closed_won'

**Data integration:**
```javascript
const SaleFunnel = () => {
  const { data: leads } = useLeads();
  const { data: opportunities } = useOpportunities();
  
  const funnelData = useMemo(() => [
    { stage: 'Leads', count: leads?.length || 0 },
    { stage: 'Qualified', count: leads?.filter(l => l.status === 'qualified').length || 0 },
    { stage: 'Opportunities', count: opportunities?.length || 0 },
    { stage: 'Won', count: opportunities?.filter(o => o.stage === 'closed_won').length || 0 }
  ], [leads, opportunities]);
  
  return (
    // Existing funnel chart with real data
  );
};
```

### Step 8: Create Pipeline Health Widget ⏳ PLANNED

**Duration**: 3-4 hours
**Status**: ⏳ Planned
**Assigned**: react-mui-frontend-engineer

**Files to create:**
- `src/components/sections/dashboards/crm/pipeline-health/PipelineHealth.jsx`
- `src/components/sections/dashboards/crm/pipeline-health/StageDistribution.jsx`
- `src/components/sections/dashboards/crm/pipeline-health/HealthMetrics.jsx`

**Purpose**: Visual representation of pipeline health and stage distribution

**Features:**
- Donut chart showing opportunities by stage
- Health score based on stage distribution
- Average time in each stage
- Stage conversion rates

**Component structure:**
```javascript
const PipelineHealth = () => {
  const { data: opportunities } = useOpportunities();
  
  const healthMetrics = useMemo(() => 
    calculatePipelineHealth(opportunities), [opportunities]
  );
  
  return (
    <Card>
      <CardHeader title="Pipeline Health" />
      <CardContent>
        <Grid container spacing={2}>
          <Grid size={8}>
            <StageDistribution data={healthMetrics.stageDistribution} />
          </Grid>
          <Grid size={4}>
            <HealthMetrics metrics={healthMetrics} />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
```

### Step 9: Update Dashboard Layout ⏳ PLANNED

**Duration**: 2-3 hours
**Status**: ⏳ Planned
**Assigned**: react-mui-frontend-engineer

**File to modify**: `src/components/sections/dashboards/crm/index.jsx`

**Current layout**: 8 widgets in Aurora template layout
**Target layout**: Enhanced layout with new PierceDesk widgets

**New layout structure:**
```javascript
const CRM = () => {
  return (
    <Grid container spacing={3}>
      {/* Row 1: Greeting */}
      <Grid size={12}>
        <CRMGreeting />
      </Grid>

      {/* Row 2: KPIs + Pipeline Health */}
      <Grid container size={12}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <CRMKPIs />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <PipelineHealth />
        </Grid>
      </Grid>

      {/* Row 3: Recent Activities + Top Opportunities */}
      <Grid container size={12}>
        <Grid size={{ xs: 12, md: 6 }}>
          <RecentActivities />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TopOpportunities />
        </Grid>
      </Grid>

      {/* Row 4: Lead Sources + Sales Funnel */}
      <Grid container size={12}>
        <Grid size={{ xs: 12, md: 6 }}>
          <LeadSources />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SaleFunnel />
        </Grid>
      </Grid>

      {/* Row 5: Generated Revenue (existing) */}
      <Grid size={12}>
        <CRMGeneratedRevenue />
      </Grid>
    </Grid>
  );
};
```

### Step 10: Create Dashboard Loading States ⏳ PLANNED

**Duration**: 1-2 hours
**Status**: ⏳ Planned
**Assigned**: react-mui-frontend-engineer

**Files to create:**
- `src/components/sections/dashboards/crm/common/DashboardSkeleton.jsx`
- `src/components/sections/dashboards/crm/common/WidgetSkeleton.jsx`

**Purpose**: Consistent loading states for all dashboard widgets

**Features:**
- Skeleton components matching widget layouts
- Shimmer animation effects
- Responsive skeleton sizing
- Error state handling

### Step 11: Add Real-time Data Refresh ⏳ PLANNED

**Duration**: 2-3 hours
**Status**: ⏳ Planned
**Assigned**: react-mui-frontend-engineer

**File to create**: `src/hooks/useDashboardRefresh.js`

**Purpose**: Automatic data refresh for dashboard widgets

**Features:**
- Configurable refresh intervals
- Manual refresh button
- Last updated timestamp
- Pause refresh when tab not active
- TODO markers for real-time subscriptions after Phase 1.2

### Step 12: Create E2E Tests ⏳ PLANNED

**Duration**: 4-5 hours
**Status**: ⏳ Planned
**Assigned**: playwright-tester

**Files to create:**
1. `tests/crm-dashboard.spec.js` (20 active tests)
2. `tests/crm-dashboard-multi-tenancy.spec.js` (5 tests marked .skip())

**Test suites:**

**crm-dashboard.spec.js:**
1. Dashboard Loading (5 tests):
   - Dashboard page loads without errors
   - All widgets render correctly
   - Loading states display properly
   - Error states handled gracefully
   - Responsive layout works on mobile

2. Widget Functionality (10 tests):
   - CRM greeting shows correct metrics
   - KPIs display real calculated values
   - Recent activities timeline renders
   - Top opportunities list displays
   - Lead sources chart shows data
   - Sales funnel displays stages
   - Pipeline health widget renders
   - Click-through navigation works

3. Data Integration (5 tests):
   - Dashboard updates when data changes
   - Refresh functionality works
   - Empty states display correctly
   - Calculations are accurate
   - Performance is acceptable (<2s load)

**crm-dashboard-multi-tenancy.spec.js (.skip()):**
1. Organization data isolation (2 tests)
2. Dashboard metrics per organization (2 tests)
3. Cross-organization access prevention (1 test)

### Step 13: Performance Optimization ⏳ PLANNED

**Duration**: 2-3 hours
**Status**: ⏳ Planned
**Assigned**: react-mui-frontend-engineer

**Optimizations:**
1. Memoize expensive calculations
2. Lazy load chart components
3. Implement virtual scrolling for large lists
4. Optimize re-renders with React.memo
5. Add performance monitoring

**Performance targets:**
- Dashboard initial load: <2 seconds
- Widget refresh: <500ms
- Chart rendering: <1 second
- Memory usage: <50MB

### Step 14: Verification & Testing ⏳ PLANNED

**Duration**: 2-3 hours
**Status**: ⏳ Planned

**Commands to run:**
```bash
npm run lint
npm run build
npm run test:e2e -- crm-dashboard
npm run test:unit -- dashboard
```

**Manual testing checklist:**
- [ ] Navigate to `/dashboard/crm` - Dashboard loads
- [ ] All widgets display with real data
- [ ] KPI calculations are accurate
- [ ] Recent activities timeline works
- [ ] Top opportunities list displays
- [ ] Lead sources chart shows data
- [ ] Sales funnel displays correctly
- [ ] Click-through navigation works
- [ ] Responsive design on mobile
- [ ] Loading states display properly
- [ ] Error handling works
- [ ] Performance meets targets

### Step 15: Documentation & Commit ⏳ PLANNED

**Duration**: 1-2 hours
**Status**: ⏳ Planned

**Files to create/update:**
1. Update this execution document with results
2. Update `_sys_documents/execution/INDEX-crm-desk-mvp.md` (Phase 1.7 status)
3. Create user documentation: `docs/features/CRM-DASHBOARD.md`
4. Capture verification evidence (screenshots, test results)

**Commit message:**
```
Add Phase 1.7: CRM Dashboard & Reports (ready for Phase 1.2 integration)

## Overview
Comprehensive CRM dashboard with real-time insights into sales pipeline.
Integrates data from Phases 1.3-1.5 with enhanced widgets and analytics.
All components functional with mock data, ready for database integration.

## Components Added (XX new files)
- Enhanced CRM dashboard with real data integration
- Recent Activities timeline (Digital Thread foundation)
- Top Opportunities widget
- Pipeline Health analytics
- Dashboard loading states and error handling

## Tests Created (25 tests total)
- crm-dashboard.spec.js (20 active tests)
- crm-dashboard-multi-tenancy.spec.js (5 tests marked .skip())

## Verification Evidence
✅ Build: Exit 0
✅ Lint: 0 errors in Phase 1.7 files
✅ All widgets functional with real CRM data
✅ Performance targets met (<2s load time)

## TODO Markers
XX TODO markers for Phase 1.2 real-time integration

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

## Progress Tracking

### Overall Progress: 0% (0 of 15 steps complete)

**Planned (100%):**
- [ ] Step 1: Create dashboard data integration layer
- [ ] Step 2: Enhance CRM greeting widget
- [ ] Step 3: Update CRM KPIs widget
- [ ] Step 4: Create recent activities widget
- [ ] Step 5: Create top opportunities widget
- [ ] Step 6: Enhance lead sources widget
- [ ] Step 7: Update sales funnel widget
- [ ] Step 8: Create pipeline health widget
- [ ] Step 9: Update dashboard layout
- [ ] Step 10: Create dashboard loading states
- [ ] Step 11: Add real-time data refresh
- [ ] Step 12: Create E2E tests
- [ ] Step 13: Performance optimization
- [ ] Step 14: Verification & testing
- [ ] Step 15: Documentation & commit

### Files to Create/Modify

**New Files (15+ files):**
- Dashboard service: 1 file
- New widgets: 8 files
- Loading states: 2 files
- Hooks: 1 file
- Tests: 2 files
- Documentation: 1 file

**Modified Files (5 files):**
- CRMGreeting.jsx
- CRMKPIs.jsx
- LeadSources.jsx
- SaleFunnel.jsx
- crm/index.jsx (main dashboard)

---

## Integration Points (TODO Markers)

### Estimated TODO Markers: 12-15 total

**Dashboard Service (3 markers):**
- Real-time pipeline calculations
- Database-based activity queries
- Performance optimization queries

**Widget Components (6 markers):**
- Real-time data subscriptions
- Advanced filtering capabilities
- Cross-widget data synchronization

**Performance (3 markers):**
- Caching strategies
- Background data refresh
- Memory optimization

---

## Dependencies & Blockers

**Blocks:**
- Phase 1.8 (Testing & Polish)
- Post-MVP advanced reporting features

**Blocked by:**
- Phase 1.2 (Auth & Multi-Tenancy) - 60% complete
  - Required for: Real-time data subscriptions
  - Required for: Multi-tenancy dashboard tests
  - Required for: Organization-specific metrics

**Current Blockers:** None (mock data strategy unblocks Phase 1.7)

---

## Success Criteria

- [ ] All dashboard widgets display real CRM data
- [ ] KPI calculations are accurate and performant
- [ ] Recent activities timeline shows Digital Thread foundation
- [ ] Top opportunities widget drives user engagement
- [ ] Lead source analytics provide actionable insights
- [ ] Sales funnel visualization aids decision making
- [ ] Dashboard loads in <2 seconds with real data
- [ ] 25 E2E tests created (20 active, 5 pending)
- [ ] Build passes (exit 0)
- [ ] Lint passes (0 errors)
- [ ] Responsive design works on all devices
- [ ] 12-15 TODO markers documented for Phase 1.2
- [ ] User documentation complete
- [ ] Screenshots captured for all widgets

---

**Status**: ⏳ Planned (0% complete)
**Next Action**: Begin Step 1 (Dashboard data integration layer)
**Owner**: Pierce Team + Claude Code
**Last Updated**: 2026-01-27
