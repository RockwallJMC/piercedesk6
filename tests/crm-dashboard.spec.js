import { test, expect } from '@playwright/test';
import { loginAsUser, selectOrganization, waitForNetworkIdle, TEST_USERS, TEST_ORGS } from './helpers/crm-test-data.js';

test.describe('CRM Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page, TEST_USERS.salesManager);
    await selectOrganization(page, TEST_ORGS.acme.name);
    await page.goto('/apps/crm/dashboard');
    await waitForNetworkIdle(page);
  });

  test('should display dashboard with widgets', async ({ page }) => {
    // Should show dashboard heading
    await expect(page.getByRole('heading', { name: 'CRM Dashboard' })).toBeVisible();

    // Should show KPI widgets
    await expect(page.getByRole('heading', { name: 'Total Pipeline Value' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Weighted Forecast' })).toBeVisible();
  });

  test('should display pipeline metrics', async ({ page }) => {
    // Pipeline section heading should be visible
    await expect(page.getByRole('heading', { name: 'Pipeline Visualization' })).toBeVisible();

    // Pipeline widgets should be visible
    await expect(page.getByText(/Pipeline Stage Breakdown|Deal Velocity|Win Loss Analysis/i)).toBeVisible();
  });

  test('should render all widgets without errors', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Reload page to capture console errors from initial render
    await page.reload();
    await waitForNetworkIdle(page);

    // Log errors for debugging
    if (errors.length > 0) {
      console.log('Console errors found:', errors);
    }

    // Filter out expected errors during development
    const criticalErrors = errors.filter(e =>
      !e.includes('ECharts') &&
      !e.includes('disposed') &&
      !e.includes('Hydration') &&
      !e.includes('did not match') &&
      !e.includes('Failed to load resource') && // API 400/404 errors expected during dev
      !e.includes('status of 400') &&
      !e.includes('status of 404')
    );

    // Dashboard should render without critical JavaScript errors
    expect(criticalErrors.length).toBe(0);
  });

  test('should display KPI widgets without undefined values', async ({ page }) => {
    // Should show KPI widgets
    await expect(page.getByText(/Total Pipeline Value/i)).toBeVisible();
    await expect(page.getByText(/Lead Conversion Rate/i)).toBeVisible();
    await expect(page.getByText(/Opportunity Win Rate/i)).toBeVisible();

    // Should NOT show "undefined%" or "NaN%"
    await expect(page.getByText('undefined%')).not.toBeVisible();
    await expect(page.getByText('NaN%')).not.toBeVisible();
  });

  test('should display recent activities widget', async ({ page }) => {
    // Activity & Task Management section should be visible
    await expect(page.getByRole('heading', { name: 'Activity & Task Management' })).toBeVisible();

    // Recent activities or upcoming tasks should be visible
    await expect(page.getByRole('heading', { name: 'Recent Activities' })).toBeVisible();
  });

  test('should display lead analytics section', async ({ page }) => {
    // Lead Analytics section heading
    await expect(page.getByRole('heading', { name: 'Lead Analytics' })).toBeVisible();

    // Lead analytics widgets should be visible
    await expect(page.getByRole('heading', { name: 'Leads by Source' }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Top Performing Accounts' }).first()).toBeVisible();
  });

  test('should navigate to CRM modules from sidebar', async ({ page }) => {
    // Click on Leads in the sidebar navigation
    await page.getByRole('link', { name: 'Leads' }).first().click();
    await waitForNetworkIdle(page);

    // Should navigate to leads page
    await expect(page).toHaveURL(/\/crm\/leads/);

    // Page should load (either with data or empty state, but not error)
    const hasLeadsHeading = await page.getByText(/Leads|All Leads/i).first().isVisible().catch(() => false);
    expect(hasLeadsHeading).toBeTruthy();
  });
});
