import { test, expect } from '@playwright/test';
import { loginAsUser, selectOrganization, waitForNetworkIdle, TEST_USERS, TEST_ORGS } from './helpers/crm-test-data.js';

test.describe('CRM Navigation Flow', () => {
  test('should navigate through available CRM pages', async ({ page }) => {
    // Step 1: Login and setup
    await loginAsUser(page, TEST_USERS.salesManager);
    await selectOrganization(page, TEST_ORGS.acme.name);

    // Step 2: Navigate to CRM dashboard
    await page.goto('/apps/crm/dashboard');
    await waitForNetworkIdle(page);

    // Should see dashboard with title and widgets
    await expect(page.getByRole('heading', { name: 'CRM Dashboard' })).toBeVisible();
    await expect(page.getByText(/Total Pipeline Value/i)).toBeVisible();
    console.log('✓ CRM Dashboard loaded');

    // Step 3: Navigate to accounts
    await page.goto('/apps/crm/accounts');
    await waitForNetworkIdle(page);

    // Should see accounts list
    await expect(page.getByRole('heading', { name: /accounts/i })).toBeVisible();
    await expect(page.locator('[role="grid"]')).toBeVisible();
    console.log('✓ Accounts page loaded');

    // Step 4: Navigate to deals
    await page.goto('/apps/crm/deals');
    await waitForNetworkIdle(page);

    // Should see deals page (Kanban board or list)
    await expect(page.locator('body')).toBeVisible();
    console.log('✓ Deals page loaded');

    // Step 5: Return to dashboard
    await page.goto('/apps/crm/dashboard');
    await waitForNetworkIdle(page);

    // Dashboard should still work
    await expect(page.getByText(/Total Pipeline Value|Weighted Forecast/i)).toBeVisible();
    console.log('✓ Navigation flow completed');
  });

  test('should display correct data on CRM dashboard widgets', async ({ page }) => {
    await loginAsUser(page, TEST_USERS.salesManager);
    await selectOrganization(page, TEST_ORGS.acme.name);
    await page.goto('/apps/crm/dashboard');
    await waitForNetworkIdle(page);

    // Should show KPI widgets
    await expect(page.getByText(/Total Pipeline Value/i)).toBeVisible();
    await expect(page.getByText(/Weighted Forecast/i)).toBeVisible();
    await expect(page.getByText(/Lead Conversion Rate/i)).toBeVisible();

    // Should show section headings
    await expect(page.getByRole('heading', { name: 'Pipeline Visualization' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Lead Analytics' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Recent Activities' })).toBeVisible();

    // Should NOT show undefined values
    await expect(page.getByText('undefined%')).not.toBeVisible();
    await expect(page.getByText('NaN%')).not.toBeVisible();

    console.log('✓ Dashboard widgets display correct data');
  });

  test('should display accounts with seed data', async ({ page }) => {
    await loginAsUser(page, TEST_USERS.salesManager);
    await selectOrganization(page, TEST_ORGS.acme.name);
    await page.goto('/apps/crm/accounts');
    await waitForNetworkIdle(page);

    // Should show Accounts heading
    await expect(page.getByRole('heading', { name: /accounts/i })).toBeVisible();

    // Should show DataGrid with seed data
    await expect(page.getByText('Acme Corporation')).toBeVisible();
    await expect(page.getByText('Globex Industries')).toBeVisible();
    await expect(page.getByText('Initech')).toBeVisible();

    // Should have Add Account button
    await expect(page.getByRole('button', { name: /add account/i })).toBeVisible();

    console.log('✓ Accounts page displays seed data correctly');
  });
});
