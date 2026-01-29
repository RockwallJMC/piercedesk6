import { test, expect } from '@playwright/test';

test.describe('Lead-to-Proposal Complete Flow', () => {
  test('should complete full journey from lead to accepted proposal', async ({ page }) => {
    // Navigate to leads page
    await page.goto('/apps/crm/leads');

    // Create new lead
    await page.getByRole('button', { name: 'Add Lead' }).click();
    await page.getByLabel('First Name').fill('John');
    await page.getByLabel('Last Name').fill('Doe');
    await page.getByLabel('Company').fill('Test Corp');
    await page.getByLabel('Email').fill('john.doe@testcorp.com');
    await page.getByLabel('Phone').fill('555-0100');
    await page.getByRole('button', { name: 'Save' }).click();

    // Verify lead created
    await expect(page.getByText('John Doe')).toBeVisible();
    await expect(page.getByText('Test Corp')).toBeVisible();

    // Navigate to lead detail
    await page.getByRole('link', { name: 'John Doe' }).click();
    await expect(page).toHaveURL(/\/apps\/crm\/leads\/lead_/);

    // Qualify lead
    await page.getByRole('combobox', { name: 'Status' }).selectOption('qualified');
    await expect(page.getByText('Status: Qualified')).toBeVisible();

    // Convert to opportunity
    await page.getByRole('button', { name: 'Convert to Opportunity' }).click();
    await page.getByLabel('Opportunity Name').fill('Test Corp - John Doe');
    await page.getByLabel('Value').fill('50000');
    await page.getByLabel('Expected Close Date').fill('2026-03-31');
    await page.getByRole('button', { name: 'Convert' }).click();

    // Verify opportunity created
    await expect(page).toHaveURL(/\/apps\/crm\/opportunities\/opp_/);
    await expect(page.getByText('Test Corp - John Doe')).toBeVisible();
    await expect(page.getByText('$50,000')).toBeVisible();

    // Create proposal
    await page.getByRole('button', { name: 'Create Proposal' }).click();

    // Add line items
    await page.getByRole('button', { name: 'Add Row' }).click();
    await page.getByLabel('Item Type').selectOption('service');
    await page.getByLabel('Description').fill('Website Development');
    await page.getByLabel('Quantity').fill('1');
    await page.getByLabel('Unit Price').fill('45000');

    await page.getByRole('button', { name: 'Add Row' }).click();
    await page.getByLabel('Description').nth(1).fill('Hosting & Maintenance');
    await page.getByLabel('Quantity').nth(1).fill('12');
    await page.getByLabel('Unit Price').nth(1).fill('500');

    // Verify totals
    await expect(page.getByText('Subtotal: $51,000.00')).toBeVisible();
    await expect(page.getByText('Total: $51,000.00')).toBeVisible();

    // Save as draft
    await page.getByRole('button', { name: 'Save as Draft' }).click();

    // Verify proposal created
    await expect(page).toHaveURL(/\/apps\/crm\/proposals\/prop_/);
    await expect(page.getByText(/PROP-2026-/)).toBeVisible();
    await expect(page.getByText('Status: Draft')).toBeVisible();

    // Send proposal
    await page.getByRole('button', { name: 'Send Proposal' }).click();
    await expect(page.getByText('Status: Sent')).toBeVisible();

    // Preview PDF
    const [pdfPage] = await Promise.all([
      page.waitForEvent('popup'),
      page.getByRole('button', { name: 'Preview PDF' }).click()
    ]);
    await expect(pdfPage).toHaveURL(/blob:/);
    await pdfPage.close();

    // Accept proposal
    await page.getByRole('button', { name: 'Mark as Accepted' }).click();
    await expect(page.getByText('Status: Accepted')).toBeVisible();

    // Verify opportunity updated
    await page.getByRole('link', { name: 'Test Corp - John Doe' }).click();
    await expect(page.getByText('Proposal: Accepted')).toBeVisible();
  });
});

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    await page.screenshot({
      path: `test-results/lead-to-proposal-${testInfo.title}-${Date.now()}.png`,
      fullPage: true
    });
  }
});
