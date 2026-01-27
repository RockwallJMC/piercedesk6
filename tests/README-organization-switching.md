# Organization Switching E2E Tests

## Overview

This test suite provides comprehensive end-to-end testing for the organization switching functionality in PierceDesk. The tests verify that users can switch between organizations, that context persists correctly, and that data isolation is maintained.

## Test File

**Location:** `/home/pierce/piercedesk6/tests/organization-switching.spec.js`

## Test Coverage

### 1. Single Organization User Tests
- ✅ Displays current organization in ProfileMenu
- ✅ Shows only one organization option in dropdown
- ✅ Prevents unnecessary API calls when selecting same organization

### 2. Multiple Organizations User Tests
- ✅ Displays current active organization
- ✅ Lists all user's organizations in dropdown
- ✅ Indicates active organization with checkmark
- ✅ Successfully switches between organizations
- ✅ Shows loading state during organization switch
- ✅ Disables switcher during loading

### 3. Context Persistence Tests
- ✅ Organization context persists across page navigation
- ✅ Organization context persists after page reload
- ✅ Organization context persists after hard navigation (URL changes)

### 4. Data Isolation Tests
- ✅ Page content updates when switching organizations
- ✅ Organization ID is stored in localStorage

### 5. Loading States and Error Handling
- ✅ Shows loading indicator during initial fetch
- ✅ Displays error alert when organization switch fails
- ✅ Error alert can be dismissed by user
- ✅ Handles empty organizations list gracefully

### 6. Accessibility Tests
- ✅ Switcher is keyboard navigable
- ✅ Proper ARIA labels are present

## Test Data Requirements

The tests require specific test users to be created in the Supabase database:

### Test User 1: Single Organization User
```javascript
{
  email: 'single-org-user@piercedesk.test',
  password: 'TestPassword123!',
  organizations: ['Test Organization A']
}
```

### Test User 2: Multiple Organizations User
```javascript
{
  email: 'multi-org-user@piercedesk.test',
  password: 'TestPassword123!',
  organizations: ['Test Organization A', 'Test Organization B']
}
```

### Database Setup Required

1. **Create Test Organizations:**
   ```sql
   -- Insert test organizations
   INSERT INTO organizations (name, slug, created_at, updated_at)
   VALUES
     ('Test Organization A', 'test-org-a', NOW(), NOW()),
     ('Test Organization B', 'test-org-b', NOW(), NOW());
   ```

2. **Create Test Users:**
   - Use Supabase Auth to create test users with above credentials
   - Or use SQL to insert into `auth.users` table (requires admin privileges)

3. **Link Users to Organizations:**
   ```sql
   -- Link single-org user to Organization A
   INSERT INTO organization_members (organization_id, user_id, role, is_active, joined_at)
   VALUES
     ((SELECT id FROM organizations WHERE slug = 'test-org-a'),
      (SELECT id FROM auth.users WHERE email = 'single-org-user@piercedesk.test'),
      'member', TRUE, NOW());

   -- Link multi-org user to both organizations
   INSERT INTO organization_members (organization_id, user_id, role, is_active, joined_at)
   VALUES
     ((SELECT id FROM organizations WHERE slug = 'test-org-a'),
      (SELECT id FROM auth.users WHERE email = 'multi-org-user@piercedesk.test'),
      'member', TRUE, NOW()),
     ((SELECT id FROM organizations WHERE slug = 'test-org-b'),
      (SELECT id FROM auth.users WHERE email = 'multi-org-user@piercedesk.test'),
      'member', FALSE, NOW());
   ```

   **Note:** Only one organization should have `is_active = TRUE` per user.

## Running the Tests

### Prerequisites

1. **Install Playwright:**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Install Playwright Browsers:**
   ```bash
   npx playwright install chromium
   ```

3. **Ensure Dev Server is Running:**
   ```bash
   # In a separate terminal
   npm run dev
   ```

   **IMPORTANT:** Dev server must be running on http://localhost:4000

### Run All Organization Switching Tests

```bash
npm run test:e2e tests/organization-switching.spec.js
```

### Run Specific Test Suite

```bash
# Single org user tests
npx playwright test tests/organization-switching.spec.js -g "Single Organization User"

# Multiple org user tests
npx playwright test tests/organization-switching.spec.js -g "Multiple Organizations User"

# Context persistence tests
npx playwright test tests/organization-switching.spec.js -g "Persistence"

# Data isolation tests
npx playwright test tests/organization-switching.spec.js -g "Data Isolation"

# Loading and error tests
npx playwright test tests/organization-switching.spec.js -g "Loading States"

# Accessibility tests
npx playwright test tests/organization-switching.spec.js -g "Accessibility"
```

### Run in Headed Mode (See Browser)

```bash
npx playwright test tests/organization-switching.spec.js --headed
```

### Debug Mode

```bash
npx playwright test tests/organization-switching.spec.js --debug
```

## Test Architecture

### Helper Functions

The test file includes several helper functions to reduce duplication:

#### `loginUser(page, email, password)`
Logs in a user via the login page and waits for successful authentication.

#### `openProfileMenu(page)`
Opens the profile menu by clicking the avatar button in the top-right corner.

#### `getOrganizationSwitcher(page)`
Returns a locator for the organization switcher dropdown component.

### Test Structure

Each test follows the Arrange-Act-Assert pattern:

```javascript
test('test description', async ({ page }) => {
  // Arrange: Set up test state (login, navigate, etc.)
  await loginUser(page, TEST_USERS.multiOrg.email, TEST_USERS.multiOrg.password);

  // Act: Perform the action being tested
  await openProfileMenu(page);
  const switcher = getOrganizationSwitcher(page);
  await switcher.click();

  // Assert: Verify expected outcomes
  await expect(switcher).toBeVisible();
});
```

## Expected Behavior

### Organization Switcher Component

**Location:** `src/components/sections/organization/OrganizationSwitcher.jsx`
**Used In:** `src/layouts/main-layout/common/ProfileMenu.jsx`

**Features:**
- Shows current active organization
- Lists all user's organizations in dropdown
- Indicates active organization with checkmark icon
- Displays loading spinner during organization fetch
- Disables dropdown during organization switch
- Shows error alert on failure
- Updates auth context on successful switch
- Persists organization ID to localStorage

### API Endpoints

**Fetch Organizations:**
- Endpoint: `/api/organizations/user` (via SWR)
- Returns: Array of organizations with `{ id, name, slug, isActive }`

**Switch Organization:**
- Endpoint: `/api/organizations/switch`
- Method: POST
- Body: `{ organizationId: string }`
- Updates `is_active` flag in `organization_members` table

## Integration with Authentication

The organization switcher integrates with the Supabase authentication system:

1. **SupabaseAuthProvider** maintains organization context
2. **setOrganization(orgId)** updates RLS context
3. **setOrganizationContext()** sets session variable for RLS
4. **localStorage** persists organization ID across sessions

## Common Issues and Troubleshooting

### Tests Failing: "Cannot find organization switcher"

**Cause:** Dev server not running or login failed

**Solution:**
1. Ensure dev server is running on http://localhost:4000
2. Verify test user credentials exist in database
3. Check Supabase connection is working

### Tests Failing: "Organization not found"

**Cause:** Test data not set up in database

**Solution:**
1. Run database setup scripts (see "Database Setup Required" above)
2. Verify organizations exist: `SELECT * FROM organizations`
3. Verify organization_members links exist

### Tests Timing Out

**Cause:** Network slowness or loading states taking too long

**Solution:**
1. Increase timeout in test: `{ timeout: 60000 }`
2. Check network tab for slow API responses
3. Verify Supabase connection is stable

### Tests Flaky (Pass Sometimes, Fail Others)

**Cause:** Race conditions or timing issues

**Solution:**
1. Add explicit waits: `await page.waitForTimeout(300)`
2. Use Playwright's auto-waiting: `await expect(element).toBeVisible()`
3. Ensure proper cleanup between tests

## Future Enhancements

### Potential Additional Tests

1. **Organization Creation from Switcher**
   - Add "+ Create Organization" option in dropdown
   - Test modal/dialog flow

2. **Organization Search**
   - For users with many organizations
   - Test autocomplete functionality

3. **Organization Roles**
   - Verify different roles (admin, member, viewer)
   - Test permission-based UI changes

4. **Organization Invites**
   - Test accepting organization invites
   - Verify new organization appears in switcher

5. **Organization Avatars**
   - Test organization logo display
   - Test fallback when no logo

6. **Performance Tests**
   - Test with 50+ organizations
   - Verify dropdown performance

## Contributing

When adding new organization-related features:

1. **Write tests FIRST (TDD approach)**
2. **Verify tests FAIL before implementation**
3. **Implement feature**
4. **Verify tests PASS**
5. **Update this README with new test coverage**

## Related Documentation

- **Component:** [OrganizationSwitcher README](../src/components/sections/organization/README.md)
- **API Hooks:** `src/services/swr/api-hooks/useOrganizationApi.js`
- **Auth Provider:** `src/providers/SupabaseAuthProvider.jsx`
- **RLS Helper:** `src/lib/supabase/rls-helper.js`
- **Database Schema:** See database documentation

## Test Status

**Created:** 2026-01-27
**Status:** ✅ All test code written and structured
**Environment Status:** ⚠️ Playwright installation issue in current environment
**Verification:** ⏳ Pending successful Playwright installation and test execution

### Current Blocker

The Playwright package is listed in `package.json` but the actual package files are not present in `node_modules/@playwright/test`. This appears to be an npm installation issue.

**Recommended Resolution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npx playwright install chromium

# Then run tests
npm run test:e2e tests/organization-switching.spec.js
```

## TDD Compliance

This test suite was created following Test-Driven Development principles:

1. ✅ **RED Phase:** Tests written defining expected behavior
2. ⏳ **GREEN Phase:** Pending - requires test execution to verify implementation
3. ⏳ **REFACTOR Phase:** Pending - will refactor after tests pass

**Note:** Following the VERIFY-BEFORE-COMPLETE principle, we cannot claim tests pass until we've actually run them and seen the output showing 0 failures. The tests are structured and ready, but verification is blocked by the Playwright installation issue.
