import { test, expect } from '@playwright/test';
import { loginAsUser, selectOrganization, waitForNetworkIdle, TEST_USERS, TEST_ORGS } from './helpers/crm-test-data.js';

test.describe('CRM Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page, TEST_USERS.salesManager);
    await selectOrganization(page, TEST_ORGS.acme.name);
    await page.goto('/dashboard/crm');
    await waitForNetworkIdle(page);
  });

  test('should display dashboard with widgets', async ({ page }) => {
    // Should show dashboard heading
    await expect(page.getByRole('heading', { name: /dashboard|crm/i })).toBeVisible();

    // Should show some KPI widgets
    await expect(page.getByText(/pipeline|forecast|revenue/i)).toBeVisible();
  });

  test('should display pipeline metrics', async ({ page }) => {
    // Pipeline widgets should be visible
    await expect(page.getByText(/stage breakdown|opportunity/i)).toBeVisible();
  });

  test('should render all widgets without errors', async ({ page }) => {
    // Wait for all widgets to load
    await page.waitForTimeout(2000);

    // Should not have any console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Refresh to capture console
    await page.reload();
    await waitForNetworkIdle(page);

    // Should have minimal errors (ECharts disposal warnings are OK)
    const criticalErrors = errors.filter(e => !e.includes('ECharts') && !e.includes('disposed'));
    expect(criticalErrors.length).toBe(0);
  });

  test('should display sales funnel widget', async ({ page }) => {
    // Should show sale funnel
    await expect(page.getByText(/sale funnel/i)).toBeVisible();

    // Should show funnel stages with percentages
    await expect(page.getByText(/leads|qualified|proposal/i)).toBeVisible();

    // Should NOT show "undefined%"
    const undefinedPercent = page.getByText('undefined%');
    await expect(undefinedPercent).not.toBeVisible();
  });

  test('should display recent activities widget', async ({ page }) => {
    await expect(page.getByText(/recent activities|activities/i)).toBeVisible();
  });

  test('should display generated revenue chart', async ({ page }) => {
    await expect(page.getByText(/generated revenue|revenue/i)).toBeVisible();
  });

  test('should navigate to leads page from dashboard', async ({ page }) => {
    // Find and click leads link
    await page.getByRole('link', { name: /leads/i }).click();
    await waitForNetworkIdle(page);

    // Should navigate to leads page
    await expect(page).toHaveURL(/\/leads/);
  });
});
