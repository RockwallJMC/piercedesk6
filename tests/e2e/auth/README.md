# Supabase Authentication E2E Tests

This directory contains end-to-end tests for the Supabase authentication system.

## Test Files

- **`supabase-auth.spec.ts`** - Comprehensive E2E tests for authentication flows

## Test Coverage

### 1. Signup, Login, Logout Flow
- **Test**: `should complete full auth cycle: signup → login → logout`
- **Purpose**: Verifies the complete authentication workflow from user registration through logout
- **Scenarios covered**:
  - User signup with unique email
  - Auto-login after signup (if enabled)
  - Email confirmation flow (if required)
  - User login with credentials
  - User logout and session clearing

### 2. Protected Routes Middleware
- **Test 1**: `should redirect unauthenticated users from dashboard to login`
- **Purpose**: Verifies middleware protects routes requiring authentication
- **Scenario**: Unauthenticated user attempts to access `/dashboards/default` and gets redirected to login

- **Test 2**: `should allow authenticated users to access dashboard`
- **Purpose**: Verifies middleware allows authenticated users to access protected routes
- **Scenario**: Authenticated user can successfully access dashboard without redirect

### 3. Authenticated User Redirect
- **Test**: `should redirect authenticated users away from login page`
- **Purpose**: Verifies middleware prevents authenticated users from accessing auth pages
- **Scenarios covered**:
  - Authenticated user visiting login page gets redirected to dashboard
  - Authenticated user visiting signup page gets redirected to dashboard

### 4. Session Persistence
- **Test 1**: `should persist session across page refreshes`
- **Purpose**: Verifies Supabase session persists in cookies/storage
- **Scenario**: User remains authenticated after page refresh

- **Test 2**: `should clear session after logout`
- **Purpose**: Verifies logout properly clears authentication state
- **Scenario**: After logout, user can no longer access protected routes

## Running the Tests

### Run all auth tests
```bash
npx playwright test tests/e2e/auth/supabase-auth.spec.ts
```

### Run specific test
```bash
npx playwright test tests/e2e/auth/supabase-auth.spec.ts:100  # Line number of test
```

### Run with UI mode (debugging)
```bash
npx playwright test tests/e2e/auth/supabase-auth.spec.ts --ui
```

### Run with headed browser (visible)
```bash
npx playwright test tests/e2e/auth/supabase-auth.spec.ts --headed
```

## Test Configuration

Tests use the following configuration from `playwright.config.js`:
- **Base URL**: `http://localhost:4000`
- **Browser**: Chromium (desktop Chrome)
- **Workers**: 1 (sequential execution for database isolation)
- **Timeout**: 30 seconds per test
- **Web Server**: Automatically starts dev server if not running

## Environment Variables

Tests use `.env.test` configuration (automatically loaded by Playwright config):
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

## Test Data

Tests create unique users for each test run using:
```typescript
const testEmail = `test-${Date.now()}@example.com`;
const testPassword = 'TestPassword123!';
const testName = 'Test User';
```

This ensures tests are independent and can run in any order without conflicts.

## Email Confirmation Behavior

Depending on Supabase configuration, signup may require email confirmation:
- **Auto-login enabled**: User is logged in immediately after signup
- **Email confirmation required**: User receives confirmation email and must verify before login

Tests handle both scenarios gracefully:
- If auto-login: Tests verify immediate dashboard access
- If email confirmation: Tests verify confirmation message appears

## Middleware Protection

Tests verify the Next.js middleware (`src/middleware.js`) correctly:
1. **Protects routes**: Redirects `/dashboards/*` to login if unauthenticated
2. **Allows access**: Permits authenticated users to access protected routes
3. **Redirects authenticated users**: Prevents access to `/authentication/*` pages when logged in

## Common Issues

### Tests Failing with "Email confirmation may be required"
- This is expected if Supabase has email confirmation enabled
- Tests will skip portions that require full authentication
- To fully test: Either disable email confirmation in Supabase or manually confirm test emails

### Tests Failing with "ERR_CONNECTION_REFUSED"
- Dev server is not running
- Playwright config will auto-start dev server (`npm run dev`)
- Ensure port 4000 is available

### Empty Error Alert
- Occasionally, form submission shows an empty error alert briefly
- This is a timing issue with form state management
- Tests handle this gracefully by waiting and checking final state

## Test Architecture

Tests follow the **AAA pattern**:
- **Arrange**: Set up test data and navigate to page
- **Act**: Perform user actions (signup, login, logout)
- **Assert**: Verify expected outcomes (redirects, session state)

Helper functions provide clean abstractions:
- `generateTestEmail()` - Creates unique test email
- `fillSignupForm()` - Fills and submits signup form
- `fillLoginForm()` - Fills and submits login form
- `signOut()` - Clicks profile menu and signs out
- `expectToBeDashboard()` - Asserts user is on dashboard
- `expectToBeAuthPage()` - Asserts user is on auth page

## TDD Red-Green-Refactor

These tests were created following Test-Driven Development:
1. **RED**: Write failing test showing desired auth behavior
2. **Verify RED**: Run test, confirm it fails (or passes if auth already working)
3. **GREEN**: Implement Supabase auth to make test pass
4. **Verify GREEN**: Re-run test, confirm passes
5. **REFACTOR**: Clean up while keeping tests green

## Maintenance

When updating authentication:
1. Run tests BEFORE making changes (ensure they pass)
2. Make auth changes
3. Run tests AFTER changes (verify nothing broke)
4. Update tests if auth behavior changes intentionally
5. Add new tests for new auth features

## Debugging Tips

1. **Use screenshots**: Check `test-results/` for failure screenshots
2. **Use videos**: Check `test-results/` for failure videos
3. **Use traces**: Run with `--trace on` to get detailed timeline
4. **Use UI mode**: Run with `--ui` for interactive debugging
5. **Check console**: Look for console output in test results
6. **Check browser**: Run with `--headed` to see browser actions
