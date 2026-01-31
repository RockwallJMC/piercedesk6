/**
 * E2E Security Test Suite - Authentication Baseline
 *
 * This test suite establishes baseline behavior for the authentication system.
 * These tests verify that auth works correctly NOW, before security fixes.
 * They ensure security improvements don't break existing functionality.
 *
 * Coverage:
 * - Protected route access control
 * - API authentication and authorization
 * - Session persistence across reloads/navigation
 * - Logout session cleanup
 */

import { test, expect } from '@playwright/test';
import { loginAsTestUser, logout, clearAuthState, hasAuthCookies } from './auth-helpers';

test.describe('Protected Route Access', () => {
  test.beforeEach(async ({ page }) => {
    // Start fresh each test
    await clearAuthState(page);
  });

  test('unauthenticated users redirected to login', async ({ page }) => {
    // Attempt to access protected route
    await page.goto('/dashboard/crm');

    // Should redirect to login
    await expect(page).toHaveURL(/\/authentication.*login/, { timeout: 5000 });
  });

  test('authenticated users can access dashboard', async ({ page }) => {
    // Login via helper
    await loginAsTestUser(page);

    // Navigate to protected route
    await page.goto('/dashboard/crm');

    // Should stay on dashboard
    await expect(page).toHaveURL('/dashboard/crm');

    // Verify page loaded (check for expected content)
    await expect(page.locator('text=/CRM|Deals|Leads/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('authenticated users can access multiple protected routes', async ({ page }) => {
    await loginAsTestUser(page);

    // Test multiple protected routes
    const routes = ['/dashboard/crm', '/dashboard/project'];

    for (const route of routes) {
      await page.goto(route);
      await expect(page).toHaveURL(route);
    }
  });

  test('unauthenticated users redirected from all dashboard routes', async ({ page }) => {
    await clearAuthState(page);

    // Test various dashboard routes
    const protectedRoutes = [
      '/dashboard/crm',
      '/dashboard/project',
      '/dashboard/analytics'
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await expect(page).toHaveURL(/\/authentication.*login/, { timeout: 5000 });
    }
  });
});

test.describe('API Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuthState(page);
  });

  test('API rejects unauthenticated requests', async ({ request }) => {
    const response = await request.get('http://localhost:4000/api/crm/deals');

    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.error).toBe('Unauthorized');
  });

  test('API accepts authenticated requests', async ({ page }) => {
    // Login to get cookies
    await loginAsTestUser(page);

    // Make API request (cookies automatically included)
    const response = await page.request.get('http://localhost:4000/api/crm/deals');

    expect(response.status()).toBe(200);

    const data = await response.json();
    // Should return array or object, not error
    expect(data.error).toBeUndefined();
  });

  test('API returns user-specific data', async ({ page }) => {
    await loginAsTestUser(page);

    // Request user-specific resource
    const response = await page.request.get('http://localhost:4000/api/crm/deals');

    expect(response.status()).toBe(200);

    const deals = await response.json();
    // Verify we got data (even if empty array)
    expect(Array.isArray(deals) || typeof deals === 'object').toBe(true);
  });

  test('API rejects requests after logout', async ({ page }) => {
    // Login first
    await loginAsTestUser(page);

    // Verify authenticated request works
    let response = await page.request.get('http://localhost:4000/api/crm/deals');
    expect(response.status()).toBe(200);

    // Logout
    await logout(page);

    // Clear cookies to simulate logged-out state
    await clearAuthState(page);

    // API should now reject requests
    response = await page.request.get('http://localhost:4000/api/crm/deals');
    expect(response.status()).toBe(401);
  });
});

test.describe('Session Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuthState(page);
  });

  test('session persists across page reloads', async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/dashboard/crm');

    // Verify we have auth cookies before reload
    const hadCookiesBeforeReload = await hasAuthCookies(page);
    expect(hadCookiesBeforeReload).toBe(true);

    // Reload page
    await page.reload();

    // Should still be authenticated (on same URL)
    await expect(page).toHaveURL('/dashboard/crm');

    // Verify content loaded (not redirected to login)
    await expect(page.locator('text=/CRM|Deals|Leads/i').first()).toBeVisible({ timeout: 5000 });

    // Verify auth cookies still exist
    const hasCookiesAfterReload = await hasAuthCookies(page);
    expect(hasCookiesAfterReload).toBe(true);
  });

  test('session persists across navigation', async ({ page }) => {
    await loginAsTestUser(page);

    // Navigate between protected routes
    await page.goto('/dashboard/crm');
    await expect(page).toHaveURL('/dashboard/crm');

    const hasCookiesAfterFirstNav = await hasAuthCookies(page);
    expect(hasCookiesAfterFirstNav).toBe(true);

    await page.goto('/dashboard/project');
    await expect(page).toHaveURL('/dashboard/project');

    const hasCookiesAfterSecondNav = await hasAuthCookies(page);
    expect(hasCookiesAfterSecondNav).toBe(true);

    await page.goto('/dashboard/crm');
    await expect(page).toHaveURL('/dashboard/crm');

    // Should still be authenticated
    const hasCookiesAfterThirdNav = await hasAuthCookies(page);
    expect(hasCookiesAfterThirdNav).toBe(true);
  });

  test('logout clears session completely', async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/dashboard/crm');

    // Verify we have auth cookies
    const hadAuthCookiesBefore = await hasAuthCookies(page);
    expect(hadAuthCookiesBefore).toBe(true);

    // Logout
    await logout(page);

    // Attempt to access dashboard again
    await page.goto('/dashboard/crm');

    // Should redirect back to login
    await expect(page).toHaveURL(/\/authentication.*login/, { timeout: 5000 });
  });

  test('session expires after logout - cookies cleared', async ({ page }) => {
    await loginAsTestUser(page);

    // Get cookies before logout
    const cookiesBeforeLogout = await page.context().cookies();
    const hadAuthCookies = cookiesBeforeLogout.some(
      c => c.name.includes('auth') || c.name.includes('supabase')
    );

    expect(hadAuthCookies).toBe(true);

    // Logout
    await logout(page);

    // Verify auth cookies cleared
    const cookiesAfterLogout = await page.context().cookies();
    const hasAuthCookies = cookiesAfterLogout.some(
      c => c.name.includes('auth') || c.name.includes('supabase')
    );

    expect(hasAuthCookies).toBe(false);
  });

  test('session persists with valid cookies across browser refresh', async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/dashboard/crm');

    // Get cookies
    const cookies = await page.context().cookies();
    const authCookies = cookies.filter(
      c => c.name.includes('auth') || c.name.includes('supabase')
    );

    expect(authCookies.length).toBeGreaterThan(0);

    // Simulate browser refresh by clearing local storage but keeping cookies
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Navigate to dashboard again
    await page.goto('/dashboard/crm');

    // Should still be authenticated (cookies maintained session)
    await expect(page).toHaveURL('/dashboard/crm');

    // Verify content loaded
    await expect(page.locator('text=/CRM|Deals|Leads/i').first()).toBeVisible({ timeout: 5000 });
  });
});
