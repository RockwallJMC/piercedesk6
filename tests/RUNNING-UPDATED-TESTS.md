# Running Updated E2E Tests (Task 6)

## Prerequisites

**CRITICAL:** The dev server MUST be running before executing tests.

```bash
# In a separate terminal, start the dev server
npm run dev

# Server will run on http://localhost:4000
# Keep this terminal open during test execution
```

## Test Files Updated

This task updated 23 tests across 4 files to use real Supabase data:

1. **Multi-User Isolation Tests** (5 tests) - `tests/crm-multi-user-isolation.spec.js`
   - Organization A cannot see Organization B leads
   - Organization A cannot see Organization B opportunities
   - Organization A cannot see Organization B proposals
   - Organization A cannot see Organization B contacts
   - Organization A cannot see Organization B accounts

2. **Mobile Responsiveness Tests** (12 tests) - `tests/crm-mobile-responsiveness.spec.js`
   - Mobile (390x844): Leads, Opportunities, Contacts, Proposals
   - Tablet (1024x1366): Leads, Opportunities, Contacts, Proposals
   - Desktop (1920x1080): Leads, Opportunities, Contacts, Proposals

3. **Input Validation Tests** (5 tests) - `tests/security/input-validation.spec.js`
   - Lead form email validation
   - Lead form XSS prevention
   - Proposal form numeric validation
   - Contact form phone validation
   - Opportunity form date validation

4. **E2E Flow Test** (1 test) - `tests/crm-lead-to-proposal-flow.spec.js`
   - Complete lead-to-proposal journey

## Running Tests

### Run All Updated Tests

```bash
# Run all 4 test files
npx playwright test tests/crm-multi-user-isolation.spec.js tests/crm-mobile-responsiveness.spec.js tests/security/input-validation.spec.js tests/crm-lead-to-proposal-flow.spec.js
```

### Run Individual Test Suites

```bash
# Multi-user isolation (5 tests)
npx playwright test tests/crm-multi-user-isolation.spec.js

# Mobile responsiveness (12 tests)
npx playwright test tests/crm-mobile-responsiveness.spec.js

# Input validation (5 tests)
npx playwright test tests/security/input-validation.spec.js

# E2E flow (1 test)
npx playwright test tests/crm-lead-to-proposal-flow.spec.js
```

### Run with UI Mode (Recommended for Debugging)

```bash
npx playwright test --ui tests/crm-multi-user-isolation.spec.js
```

### Run in Headed Mode (See Browser)

```bash
npx playwright test --headed tests/crm-multi-user-isolation.spec.js
```

## Test Data

Tests use real Supabase data created in Task 1:

**Organizations:**
- Acme Corporation (ID: 00000000-0000-0000-0000-000000000001)
- TechStart Industries (ID: 00000000-0000-0000-0000-000000000002)

**Test Users:**
- admin@acme-corp.com / TestPass123!
- ceo@techstart.com / TestPass123!

**Test Data IDs:**
- Acme Lead: l1000000-0000-0000-0000-000000000001 (Michael Johnson)
- TechStart Lead: l2000000-0000-0000-0000-000000000001 (Emily Davis)

See `tests/helpers/multi-tenant-setup.js` for complete test data reference.

## New Test Helpers

Created `tests/helpers/multi-tenant-setup.js` with utilities:

- `loginAsOrgUser(page, org, userRole)` - Login as specific org user
- `logout(page)` - Logout current user
- `verifyAccessDenied(page, url)` - Verify RLS isolation
- `getRowCount(page)` - Count data rows in grid/table
- `waitForDatabase(ms)` - Wait for async Supabase operations
- `TEST_ORGS` - Organization test data
- `TEST_DATA` - Lead/Opportunity/Proposal/Contact/Account test data

## Key Changes

### 1. Authentication
All tests now login before execution using real Supabase credentials.

### 2. RLS Verification
Multi-user isolation tests verify Row Level Security by:
- Logging in as Org A user
- Counting visible records
- Logging out and logging in as Org B user
- Verifying different record counts
- Attempting direct access to Org A records (should be denied)

### 3. Resilient Selectors
Updated selectors to be more flexible:
- Use `.filter({ hasText: /pattern/i })` for text matching
- Use multiple fallback selectors
- Use role-based selectors where possible
- Add proper wait conditions

### 4. Database Timing
Added `waitForDatabase()` calls after:
- Creating records
- Updating records
- Status changes
- Any Supabase operation

### 5. Real URLs
All tests use full URLs: `http://localhost:4000/apps/crm/...`

## Expected Results

All 23 tests should pass with:
- ✅ 5/5 multi-user isolation tests passing
- ✅ 12/12 mobile responsiveness tests passing
- ✅ 5/5 input validation tests passing
- ✅ 1/1 E2E flow test passing

## Troubleshooting

### Tests Fail with "Not authenticated"
**Solution:** Ensure seed data was loaded (Task 1) and test users exist.

### Tests Fail with "Cannot find element"
**Solution:** Check that dev server is running on port 4000.

### Tests Timeout
**Solution:** Increase timeout in playwright.config.js or specific test.

### RLS Tests Show Same Data Count
**Solution:** Verify RLS policies are enabled in Supabase (Task 2).

### Screenshots Missing
**Solution:** Create `test-results/` directory if it doesn't exist.

## Next Steps

After tests pass:
1. Review test results and screenshots
2. Fix any failing tests
3. Run verification commands (lint, build)
4. Commit changes with evidence
5. Create PR for Task 6 (as per new workflow)

## Notes

- Tests run against live Supabase database (not local)
- Test data is persistent (not cleaned up after tests)
- Mobile responsiveness tests create screenshots in `test-results/`
- Some tests may be flaky on first run (re-run if needed)
