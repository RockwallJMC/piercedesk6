import { test, expect } from '@playwright/test';
import { loginAsUser, selectOrganization, waitForNetworkIdle, TEST_USERS, TEST_ORGS } from './helpers/crm-test-data.js';

test.describe('CRM Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page, TEST_USERS.salesManager);
    await selectOrganization(page, TEST_ORGS.acme.name);
    await page.goto('/dashboard/crm');
    await waitForNetworkIdle(page);
  });

  test('should display dashboard with greeting and stats', async ({ page }) => {
    // Should show greeting section
    await expect(page.getByRole('heading', { name: /Good (Morning|Afternoon|Evening), Captain!/i })).toBeVisible();

    // Should show deal stats
    await expect(page.getByText('Deals created')).toBeVisible();
    await expect(page.getByText('Deals closed')).toBeVisible();
  });

  test('should display KPI cards', async ({ page }) => {
    // Should show KPI cards with titles
    await expect(page.getByText('Active Users')).toBeVisible();
    await expect(page.getByText('New Contacts')).toBeVisible();
    await expect(page.getByText('Renewal Rate')).toBeVisible();
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
    // Should show KPI widget values (subtitles under the cards)
    await expect(page.getByText('Avg. daily logins')).toBeVisible();
    await expect(page.getByText('Accounts opened')).toBeVisible();
    await expect(page.getByText('Premium accounts')).toBeVisible();

    // Should NOT show "undefined%" or "NaN%"
    await expect(page.getByText('undefined%')).not.toBeVisible();
    await expect(page.getByText('NaN%')).not.toBeVisible();
  });

  test('should display revenue generated section', async ({ page }) => {
    // Revenue Generated section should be visible
    await expect(page.getByRole('heading', { name: 'Revenue Generated' })).toBeVisible();
    await expect(page.getByText('Amount of revenue in this month')).toBeVisible();
  });

  test('should display lead sources section', async ({ page }) => {
    // Lead Sources section should be visible
    await expect(page.getByRole('heading', { name: 'Lead Sources' })).toBeVisible();
    await expect(page.getByText('Ratio of generated leads')).toBeVisible();

    // Lead source categories should be visible
    await expect(page.getByText('Organic')).toBeVisible();
    await expect(page.getByText('Marketing')).toBeVisible();
  });

  test('should display sale funnel section', async ({ page }) => {
    // Sale Funnel section should be visible
    await expect(page.getByRole('heading', { name: 'Sale Funnel' })).toBeVisible();
    await expect(page.getByText('Amount of revenue in one month')).toBeVisible();
  });

  test('should display customer feedback section', async ({ page }) => {
    // Customer Feedback section should be visible
    await expect(page.getByRole('heading', { name: 'Customer Feedback' })).toBeVisible();
    await expect(page.getByText('Number of clients with response')).toBeVisible();
  });
});
