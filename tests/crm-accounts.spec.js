import { test, expect } from '@playwright/test';
import { loginAsUser, selectOrganization, waitForNetworkIdle, TEST_USERS, TEST_ORGS } from './helpers/crm-test-data.js';

test.describe('CRM Accounts Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page, TEST_USERS.salesManager);
    await selectOrganization(page, TEST_ORGS.acme.name);
    await page.goto('/apps/crm/accounts');
    await waitForNetworkIdle(page);
  });

  test('should display accounts list', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /accounts/i })).toBeVisible();

    // Should show DataGrid with accounts
    const grid = page.locator('[role="grid"]');
    await expect(grid).toBeVisible();

    // Should have at least 1 account row
    const rows = grid.locator('[role="row"]').filter({ has: page.locator('[role="gridcell"]') });
    await expect(rows.first()).toBeVisible();
  });

  test('should create new account', async ({ page }) => {
    await page.getByRole('button', { name: /add account|create account/i }).click();

    // Fill account form
    await page.getByLabel('Account Name').fill('New Enterprise Client');
    await page.getByLabel('Industry').fill('Technology');
    await page.getByLabel('Website').fill('https://newclient.example.com');
    await page.getByLabel('Phone').fill('+1-555-9999');

    await page.getByRole('button', { name: /save|create/i }).click();
    await waitForNetworkIdle(page);

    // Should show success message
    await expect(page.getByText(/account created|success/i)).toBeVisible();

    // Should appear in list
    await expect(page.getByText('New Enterprise Client')).toBeVisible();
  });

  test('should view account details', async ({ page }) => {
    // Click first account in list
    const firstAccount = page.locator('[role="row"]').filter({ has: page.locator('[role="gridcell"]') }).first();
    const accountName = await firstAccount.locator('[role="gridcell"]').first().textContent();

    await firstAccount.click();
    await waitForNetworkIdle(page);

    // Should navigate to detail page
    await expect(page).toHaveURL(/\/accounts\/[^/]+$/);
    await expect(page.getByRole('heading', { name: accountName })).toBeVisible();

    // Should show tabs: Overview, Contacts, Opportunities, etc.
    await expect(page.getByRole('tab', { name: /overview/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /contacts/i })).toBeVisible();
  });

  test('should edit account', async ({ page }) => {
    // Navigate to first account
    const firstAccount = page.locator('[role="row"]').filter({ has: page.locator('[role="gridcell"]') }).first();
    await firstAccount.click();
    await waitForNetworkIdle(page);

    // Click edit button
    await page.getByRole('button', { name: /edit/i }).click();

    // Update account name
    const nameField = page.getByLabel('Account Name');
    await nameField.clear();
    await nameField.fill('Updated Account Name');

    await page.getByRole('button', { name: /save/i }).click();
    await waitForNetworkIdle(page);

    // Should show success message
    await expect(page.getByText(/updated|success/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Updated Account Name' })).toBeVisible();
  });

  test('should delete account', async ({ page }) => {
    // Navigate to first account
    const firstAccount = page.locator('[role="row"]').filter({ has: page.locator('[role="gridcell"]') }).first();
    const accountName = await firstAccount.locator('[role="gridcell"]').first().textContent();
    await firstAccount.click();
    await waitForNetworkIdle(page);

    // Click delete button
    await page.getByRole('button', { name: /delete/i }).click();

    // Confirm deletion
    await page.getByRole('button', { name: /confirm|delete/i }).click();
    await waitForNetworkIdle(page);

    // Should redirect to list
    await expect(page).toHaveURL(/\/accounts$/);

    // Account should not appear in list
    await expect(page.getByText(accountName)).not.toBeVisible();
  });

  test('should search accounts', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('Acme');
    await waitForNetworkIdle(page);

    // Should filter results
    const rows = page.locator('[role="row"]').filter({ has: page.locator('[role="gridcell"]') });
    await expect(rows.first()).toContainText(/acme/i);
  });

  test('should sort accounts by name', async ({ page }) => {
    // Click column header to sort
    await page.getByRole('columnheader', { name: /name|account/i }).click();
    await waitForNetworkIdle(page);

    // Get first and second row names
    const rows = page.locator('[role="row"]').filter({ has: page.locator('[role="gridcell"]') });
    const firstName = await rows.nth(0).locator('[role="gridcell"]').first().textContent();
    const secondName = await rows.nth(1).locator('[role="gridcell"]').first().textContent();

    // Should be in alphabetical order
    expect(firstName.localeCompare(secondName)).toBeLessThan(0);
  });
});
