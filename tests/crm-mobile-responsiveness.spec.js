import { test, expect } from '@playwright/test';
import { loginAsOrgUser } from './helpers/multi-tenant-setup.js';

test.describe('Mobile Responsiveness - Mobile (390x844)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 13 size
    // Login before each test
    await loginAsOrgUser(page, 'ACME', 'admin');
  });

  test('Leads list is responsive on mobile', async ({ page }) => {
    await page.goto('http://localhost:4000/apps/crm/leads');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Verify page loads - check for main heading or data grid
    const heading = page.locator('h1, h2, h3, h4, h5, h6').filter({ hasText: /leads/i });
    await expect(heading.first()).toBeVisible({ timeout: 5000 });

    // Verify data grid or table is visible
    const dataContainer = page.locator('[role="grid"], table, .MuiDataGrid-root').first();
    await expect(dataContainer).toBeVisible({ timeout: 5000 });

    // Take screenshot
    await page.screenshot({
      path: `test-results/leads-mobile.png`,
      fullPage: true
    });
  });

  test('Opportunities Kanban is responsive on mobile', async ({ page }) => {
    await page.goto('http://localhost:4000/apps/crm/opportunities');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Verify page loads
    const heading = page.locator('h1, h2, h3, h4, h5, h6').filter({ hasText: /opportunities/i });
    await expect(heading.first()).toBeVisible({ timeout: 5000 });

    // Verify kanban board or data grid is visible
    const dataContainer = page.locator('[role="grid"], .kanban-column, table').first();
    await expect(dataContainer).toBeVisible({ timeout: 5000 });

    await page.screenshot({
      path: `test-results/opportunities-mobile.png`,
      fullPage: true
    });
  });

  test('Contact detail page is responsive on mobile', async ({ page }) => {
    await page.goto('http://localhost:4000/apps/crm/contacts');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Verify page loads
    const heading = page.locator('h1, h2, h3, h4, h5, h6').filter({ hasText: /contacts/i });
    await expect(heading.first()).toBeVisible({ timeout: 5000 });

    // Verify data is visible
    const dataContainer = page.locator('[role="grid"], table, .MuiDataGrid-root').first();
    await expect(dataContainer).toBeVisible({ timeout: 5000 });

    await page.screenshot({
      path: `test-results/contacts-mobile.png`,
      fullPage: true
    });
  });

  test('Proposals list is responsive on mobile', async ({ page }) => {
    await page.goto('http://localhost:4000/apps/crm/proposals');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Verify page loads
    const heading = page.locator('h1, h2, h3, h4, h5, h6').filter({ hasText: /proposals/i });
    await expect(heading.first()).toBeVisible({ timeout: 5000 });

    // Verify data is visible
    const dataContainer = page.locator('[role="grid"], table, .MuiDataGrid-root').first();
    await expect(dataContainer).toBeVisible({ timeout: 5000 });

    await page.screenshot({
      path: `test-results/proposals-mobile.png`,
      fullPage: true
    });
  });
});

test.describe('Mobile Responsiveness - Tablet (1024x1366)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 1366 }); // iPad Pro size
    // Login before each test
    await loginAsOrgUser(page, 'ACME', 'admin');
  });

  test('Leads list is responsive on tablet', async ({ page }) => {
    await page.goto('http://localhost:4000/apps/crm/leads');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Verify page loads
    const heading = page.locator('h1, h2, h3, h4, h5, h6').filter({ hasText: /leads/i });
    await expect(heading.first()).toBeVisible({ timeout: 5000 });

    // Verify data grid or table is visible
    const dataContainer = page.locator('[role="grid"], table, .MuiDataGrid-root').first();
    await expect(dataContainer).toBeVisible({ timeout: 5000 });

    await page.screenshot({
      path: `test-results/leads-tablet.png`,
      fullPage: true
    });
  });

  test('Opportunities Kanban is responsive on tablet', async ({ page }) => {
    await page.goto('http://localhost:4000/apps/crm/opportunities');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Verify page loads
    const heading = page.locator('h1, h2, h3, h4, h5, h6').filter({ hasText: /opportunities/i });
    await expect(heading.first()).toBeVisible({ timeout: 5000 });

    // Verify kanban board or data grid is visible
    const dataContainer = page.locator('[role="grid"], .kanban-column, table').first();
    await expect(dataContainer).toBeVisible({ timeout: 5000 });

    await page.screenshot({
      path: `test-results/opportunities-tablet.png`,
      fullPage: true
    });
  });

  test('Contact detail page is responsive on tablet', async ({ page }) => {
    await page.goto('http://localhost:4000/apps/crm/contacts');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Verify page loads
    const heading = page.locator('h1, h2, h3, h4, h5, h6').filter({ hasText: /contacts/i });
    await expect(heading.first()).toBeVisible({ timeout: 5000 });

    // Verify data is visible
    const dataContainer = page.locator('[role="grid"], table, .MuiDataGrid-root').first();
    await expect(dataContainer).toBeVisible({ timeout: 5000 });

    await page.screenshot({
      path: `test-results/contacts-tablet.png`,
      fullPage: true
    });
  });

  test('Proposals list is responsive on tablet', async ({ page }) => {
    await page.goto('http://localhost:4000/apps/crm/proposals');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Verify page loads
    const heading = page.locator('h1, h2, h3, h4, h5, h6').filter({ hasText: /proposals/i });
    await expect(heading.first()).toBeVisible({ timeout: 5000 });

    // Verify data is visible
    const dataContainer = page.locator('[role="grid"], table, .MuiDataGrid-root').first();
    await expect(dataContainer).toBeVisible({ timeout: 5000 });

    await page.screenshot({
      path: `test-results/proposals-tablet.png`,
      fullPage: true
    });
  });
});

test.describe('Mobile Responsiveness - Desktop (1920x1080)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    // Login before each test
    await loginAsOrgUser(page, 'ACME', 'admin');
  });

  test('Leads list is responsive on desktop', async ({ page }) => {
    await page.goto('http://localhost:4000/apps/crm/leads');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Verify page loads
    const heading = page.locator('h1, h2, h3, h4, h5, h6').filter({ hasText: /leads/i });
    await expect(heading.first()).toBeVisible({ timeout: 5000 });

    // Verify data grid or table is visible
    const dataContainer = page.locator('[role="grid"], table, .MuiDataGrid-root').first();
    await expect(dataContainer).toBeVisible({ timeout: 5000 });

    await page.screenshot({
      path: `test-results/leads-desktop.png`,
      fullPage: true
    });
  });

  test('Opportunities Kanban is responsive on desktop', async ({ page }) => {
    await page.goto('http://localhost:4000/apps/crm/opportunities');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Verify page loads
    const heading = page.locator('h1, h2, h3, h4, h5, h6').filter({ hasText: /opportunities/i });
    await expect(heading.first()).toBeVisible({ timeout: 5000 });

    // Verify kanban board or data grid is visible
    const dataContainer = page.locator('[role="grid"], .kanban-column, table').first();
    await expect(dataContainer).toBeVisible({ timeout: 5000 });

    await page.screenshot({
      path: `test-results/opportunities-desktop.png`,
      fullPage: true
    });
  });

  test('Contact detail page is responsive on desktop', async ({ page }) => {
    await page.goto('http://localhost:4000/apps/crm/contacts');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Verify page loads
    const heading = page.locator('h1, h2, h3, h4, h5, h6').filter({ hasText: /contacts/i });
    await expect(heading.first()).toBeVisible({ timeout: 5000 });

    // Verify data is visible
    const dataContainer = page.locator('[role="grid"], table, .MuiDataGrid-root').first();
    await expect(dataContainer).toBeVisible({ timeout: 5000 });

    await page.screenshot({
      path: `test-results/contacts-desktop.png`,
      fullPage: true
    });
  });

  test('Proposals list is responsive on desktop', async ({ page }) => {
    await page.goto('http://localhost:4000/apps/crm/proposals');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Verify page loads
    const heading = page.locator('h1, h2, h3, h4, h5, h6').filter({ hasText: /proposals/i });
    await expect(heading.first()).toBeVisible({ timeout: 5000 });

    // Verify data is visible
    const dataContainer = page.locator('[role="grid"], table, .MuiDataGrid-root').first();
    await expect(dataContainer).toBeVisible({ timeout: 5000 });

    await page.screenshot({
      path: `test-results/proposals-desktop.png`,
      fullPage: true
    });
  });
});
