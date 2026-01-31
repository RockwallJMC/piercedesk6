/**
 * Authentication Helper Utilities for Security Tests
 *
 * These helpers provide reusable functions for authentication flows
 * in E2E security tests. They establish baseline auth behavior that
 * should continue working after security fixes.
 */

import { expect } from '@playwright/test';

/**
 * Login as test user via Supabase auth
 * Uses the ACME admin user from multi-tenant test setup
 *
 * @param {Page} page - Playwright page object
 */
export async function loginAsTestUser(page) {
  // Navigate to login page
  await page.goto('/authentication/default/jwt/login');

  // Fill in credentials (ACME admin user from test seeds)
  await page.getByLabel('Email').fill('admin@acme-corp.com');
  await page.getByLabel('Password').fill('TestPass123!');

  // Submit form
  await page.getByRole('button', { name: 'Log in' }).click();

  // Wait for redirect to dashboard (confirms login success)
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
}

/**
 * Logout current user
 * Follows the same pattern as auth-supabase.spec.js
 *
 * @param {Page} page - Playwright page object
 */
export async function logout(page) {
  // Navigate to a dashboard page first (where profile menu is visible)
  await page.goto('/dashboard/crm');

  // Wait for the page to be ready
  await page.waitForLoadState('networkidle', { timeout: 10000 });

  // Click profile menu button (it's in the action-items stack, last button)
  // The profile button is the rightmost icon in the app bar
  const actionItems = page.locator('.action-items');
  const profileButton = actionItems.locator('button').last();
  await profileButton.click({ timeout: 10000 });

  // Wait for menu to open
  await page.waitForSelector('#account-menu', { timeout: 5000 });

  // Click "Sign Out" menu item
  await page.getByRole('menuitem', { name: /sign out/i }).click();

  // Wait for redirect to logged-out page
  await expect(page).toHaveURL(/\/(auth\/login|authentication.*logged-out)/, { timeout: 10000 });
}

/**
 * Clear all auth state (cookies, localStorage, sessionStorage)
 * Ensures tests start from a clean slate
 *
 * @param {Page} page - Playwright page object
 */
export async function clearAuthState(page) {
  await page.context().clearCookies();

  // Navigate to login page first to ensure we can access localStorage
  // (can't access localStorage on about:blank)
  try {
    await page.goto('/authentication/default/jwt/login');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  } catch (e) {
    // If page navigation fails, just clear cookies
    // This can happen if server isn't running
  }
}

/**
 * Check if user has valid auth cookies
 * Verifies session persistence
 *
 * @param {Page} page - Playwright page object
 * @returns {Promise<boolean>} - true if auth cookies exist
 */
export async function hasAuthCookies(page) {
  const cookies = await page.context().cookies();
  return cookies.some(c => c.name.includes('auth') || c.name.includes('supabase'));
}
