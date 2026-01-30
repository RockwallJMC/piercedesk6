const { test, expect } = require('@playwright/test');

test.describe('Service Agreements Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to service agreements page
    await page.goto('/apps/service-agreements');
    await page.waitForLoadState('networkidle');
  });

  test('should display service agreements list', async ({ page }) => {
    // Check if page title is visible
    await expect(page.getByRole('heading', { name: 'Service Agreements' })).toBeVisible();
    
    // Check if description is visible
    await expect(page.getByText('Manage ongoing service contracts')).toBeVisible();
    
    // Check if DataGrid is visible
    await expect(page.locator('.MuiDataGrid-root')).toBeVisible();
    
    // Check if New Agreement button exists
    await expect(page.getByRole('button', { name: /New Agreement/i })).toBeVisible();
  });

  test('should display agreement cards in grid', async ({ page }) => {
    // Wait for data to load
    await page.waitForSelector('[data-field="agreementNumber"]');
    
    // Check if at least one agreement is displayed
    const rows = page.locator('.MuiDataGrid-row');
    await expect(rows).not.toHaveCount(0);
    
    // Verify column headers
    await expect(page.getByText('Agreement #')).toBeVisible();
    await expect(page.getByText('Name')).toBeVisible();
    await expect(page.getByText('Type')).toBeVisible();
    await expect(page.getByText('Status')).toBeVisible();
  });

  test('should filter agreements by status', async ({ page }) => {
    // Wait for agreements to load
    await page.waitForSelector('.MuiDataGrid-row');
    
    // Click on active filter
    await page.getByRole('button', { name: 'Active' }).click();
    
    // Verify filter is applied
    await expect(page.getByRole('button', { name: 'Active' })).toHaveClass(/MuiChip-filled/);
    
    // Check that filtered results are shown
    const rows = page.locator('.MuiDataGrid-row');
    await expect(rows.first()).toBeVisible();
  });

  test('should open create agreement dialog', async ({ page }) => {
    // Click New Agreement button
    await page.getByRole('button', { name: /New Agreement/i }).click();
    
    // Verify dialog is open
    await expect(page.getByRole('heading', { name: 'Create New Service Agreement' })).toBeVisible();
    
    // Verify form fields are present
    await expect(page.getByLabel('Agreement Name')).toBeVisible();
    await expect(page.getByLabel('Account')).toBeVisible();
    await expect(page.getByLabel('Agreement Type')).toBeVisible();
    await expect(page.getByLabel('Start Date')).toBeVisible();
    await expect(page.getByLabel('Monthly Fee')).toBeVisible();
    
    // Close dialog
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('heading', { name: 'Create New Service Agreement' })).not.toBeVisible();
  });

  test('should navigate to agreement detail', async ({ page }) => {
    // Wait for agreements to load
    await page.waitForSelector('[data-field="agreementNumber"]');
    
    // Click on first agreement number
    const firstAgreement = page.locator('[data-field="agreementNumber"]').first();
    await firstAgreement.click();
    
    // Verify navigation to detail page
    await expect(page).toHaveURL(/\/apps\/service-agreements\/.+/);
    
    // Verify detail page elements
    await expect(page.getByRole('button', { name: /Back to Agreements/i })).toBeVisible();
  });
});

test.describe('Service Agreement Detail', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a specific agreement detail page
    await page.goto('/apps/service-agreements/SA-2024-001');
    await page.waitForLoadState('networkidle');
  });

  test('should display agreement header information', async ({ page }) => {
    // Check header elements
    await expect(page.getByRole('button', { name: /Back to Agreements/i })).toBeVisible();
    
    // Check KPI cards
    await expect(page.getByText('Monthly Fee')).toBeVisible();
    await expect(page.getByText('Hours Used')).toBeVisible();
    await expect(page.getByText('Overage Charges')).toBeVisible();
    await expect(page.getByText('Agreement End')).toBeVisible();
  });

  test('should display and switch between tabs', async ({ page }) => {
    // Check all tabs are present
    await expect(page.getByRole('tab', { name: /Overview/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Equipment/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Schedules/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Billing/i })).toBeVisible();
    
    // Switch to Equipment tab
    await page.getByRole('tab', { name: /Equipment/i }).click();
    await expect(page.getByText('Covered Equipment')).toBeVisible();
    
    // Switch to Schedules tab
    await page.getByRole('tab', { name: /Schedules/i }).click();
    await expect(page.getByText('Maintenance Schedules')).toBeVisible();
    
    // Switch to Billing tab
    await page.getByRole('tab', { name: /Billing/i }).click();
    await expect(page.getByText('Current Period')).toBeVisible();
  });

  test('should display overview tab content', async ({ page }) => {
    // Ensure we're on overview tab
    await page.getByRole('tab', { name: /Overview/i }).click();
    
    // Check for agreement details section
    await expect(page.getByText('Agreement Details')).toBeVisible();
    await expect(page.getByText('Agreement Number')).toBeVisible();
    await expect(page.getByText('Account')).toBeVisible();
    
    // Check for description section
    await expect(page.getByText('Description & Terms')).toBeVisible();
    
    // Check for service location
    await expect(page.getByText('Service Location')).toBeVisible();
    
    // Check for quick stats
    await expect(page.getByText('Quick Stats')).toBeVisible();
    await expect(page.getByText('Covered Equipment')).toBeVisible();
  });

  test('should display equipment cards', async ({ page }) => {
    // Navigate to Equipment tab
    await page.getByRole('tab', { name: /Equipment/i }).click();
    
    // Check for add equipment button
    await expect(page.getByRole('button', { name: /Add Equipment/i })).toBeVisible();
    
    // Check if equipment cards are displayed
    const equipmentCards = page.locator('.MuiCard-root');
    const count = await equipmentCards.count();
    
    if (count > 0) {
      // Verify first card has required elements
      await expect(equipmentCards.first().getByRole('button', { name: /Service History/i })).toBeVisible();
      await expect(equipmentCards.first().getByRole('button', { name: /Edit/i })).toBeVisible();
    }
  });
});
