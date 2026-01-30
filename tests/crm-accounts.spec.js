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
    // Should show Accounts heading
    await expect(page.getByRole('heading', { name: /accounts/i })).toBeVisible();

    // Should show DataGrid with accounts
    const grid = page.locator('[role="grid"]');
    await expect(grid).toBeVisible();

    // Should have seed data accounts (Acme, Globex, Initech)
    await expect(page.getByText('Acme Corporation')).toBeVisible();
    await expect(page.getByText('Globex Industries')).toBeVisible();
    await expect(page.getByText('Initech')).toBeVisible();
  });

  test('should have Add Account button', async ({ page }) => {
    // Should have Add Account button
    await expect(page.getByRole('button', { name: /add account/i })).toBeVisible();
  });

  test('should create new account via dialog', async ({ page }) => {
    // Click Add Account button
    await page.getByRole('button', { name: /add account/i }).click();

    // Dialog should open with Create Account title
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();

    // Fill account form
    await page.getByLabel('Account Name').fill('New Enterprise Client');
    await page.getByLabel('Industry').fill('Technology');
    await page.getByLabel('Website').fill('https://newclient.example.com');
    await page.getByLabel('Phone').fill('+1-555-9999');

    // Save
    await page.getByRole('button', { name: /save/i }).click();

    // Wait for dialog to close and grid to update
    await page.waitForTimeout(500);

    // Should appear in list
    await expect(page.getByText('New Enterprise Client')).toBeVisible();

    // CLEANUP: Delete the created account to avoid polluting test data
    const row = page.locator('[role="row"]').filter({ hasText: 'New Enterprise Client' });
    const deleteButton = row.getByRole('button', { name: /delete/i });

    // Handle confirmation dialog
    page.on('dialog', dialog => dialog.accept());
    await deleteButton.click();

    // Wait for deletion to complete
    await page.waitForTimeout(500);

    // Verify it's gone
    await expect(page.getByText('New Enterprise Client')).not.toBeVisible();
  });

  test('should edit account via dialog', async ({ page }) => {
    // Find Acme Corporation row and get original industry value
    const acmeRow = page.locator('[role="row"]').filter({ hasText: 'Acme Corporation' });
    const industryCells = acmeRow.locator('[role="gridcell"]');
    const originalIndustry = await industryCells.nth(1).textContent(); // Industry is 2nd column

    // Click Edit button on Acme Corporation
    const editButton = acmeRow.getByRole('button', { name: /edit/i }).first();
    await editButton.click();

    // Dialog should open with Edit Account title
    await expect(page.getByRole('heading', { name: /edit account/i })).toBeVisible();

    // Update industry field
    const industryField = page.getByLabel('Industry');
    await industryField.clear();
    await industryField.fill('Updated Industry');

    // Save
    await page.getByRole('button', { name: /save/i }).click();

    // Wait for dialog to close and grid to update
    await page.waitForTimeout(500);

    // Should see updated value in grid
    await expect(page.getByText('Updated Industry')).toBeVisible();

    // CLEANUP: Revert the change back to original value
    const editButtonAfter = acmeRow.getByRole('button', { name: /edit/i }).first();
    await editButtonAfter.click();

    // Wait for dialog to open
    await expect(page.getByRole('heading', { name: /edit account/i })).toBeVisible();

    // Revert industry back to original
    const industryFieldRevert = page.getByLabel('Industry');
    await industryFieldRevert.clear();
    if (originalIndustry && originalIndustry.trim()) {
      await industryFieldRevert.fill(originalIndustry.trim());
    }

    // Save
    await page.getByRole('button', { name: /save/i }).click();

    // Wait for save to complete
    await page.waitForTimeout(500);
  });

  test('should delete account', async ({ page }) => {
    // Get initial count of rows
    const initialRows = await page.locator('[role="row"]').filter({ has: page.locator('[role="gridcell"]') }).count();

    // Click Delete button on a row
    const deleteButtons = page.getByRole('button', { name: /delete/i });

    // Handle confirmation dialog
    page.on('dialog', dialog => dialog.accept());
    await deleteButtons.first().click();

    // Wait for deletion to complete
    await page.waitForTimeout(500);

    // Row count should decrease
    const finalRows = await page.locator('[role="row"]').filter({ has: page.locator('[role="gridcell"]') }).count();
    expect(finalRows).toBe(initialRows - 1);
  });

  test('should search/filter accounts', async ({ page }) => {
    // Get search input
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('Acme');

    // Should filter to only show Acme
    await expect(page.getByText('Acme Corporation')).toBeVisible();
    await expect(page.getByText('Globex Industries')).not.toBeVisible();
    await expect(page.getByText('Initech')).not.toBeVisible();
  });

  test('should display column headers', async ({ page }) => {
    // Should show column headers
    await expect(page.getByRole('columnheader', { name: /name/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /industry/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /website/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /phone/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /actions/i })).toBeVisible();
  });

  test('should sort accounts by clicking column header', async ({ page }) => {
    // Click Name column header to sort
    await page.getByRole('columnheader', { name: /name/i }).click();

    // Get first row name - should be alphabetically first (Acme Corporation)
    const firstRow = page.locator('[role="row"]').filter({ has: page.locator('[role="gridcell"]') }).first();
    await expect(firstRow).toContainText('Acme Corporation');
  });
});
